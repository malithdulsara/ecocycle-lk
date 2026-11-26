package lk.ecocycle.backend.complaint;

import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.common.geo.GeoUtils;
import lk.ecocycle.backend.complaint.dto.AssignOfficerRequest;
import lk.ecocycle.backend.complaint.dto.ComplaintNoteRequest;
import lk.ecocycle.backend.complaint.dto.ComplaintResponse;
import lk.ecocycle.backend.complaint.dto.ComplaintTrackResponse;
import lk.ecocycle.backend.complaint.dto.CreateComplaintRequest;
import lk.ecocycle.backend.storage.FileStorageService;
import lk.ecocycle.backend.user.Role;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import lk.ecocycle.backend.ward.Ward;
import lk.ecocycle.backend.ward.WardRepository;
import org.locationtech.jts.geom.Point;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class ComplaintServiceImpl implements ComplaintService {

    // No 0/O or 1/I, so the code is easy to read out on the phone
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ComplaintRepository complaintRepository;
    private final WardRepository wardRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ComplaintServiceImpl(ComplaintRepository complaintRepository,
                                WardRepository wardRepository,
                                UserRepository userRepository,
                                FileStorageService fileStorageService) {
        this.complaintRepository = complaintRepository;
        this.wardRepository = wardRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    // ---------- Household and guest ----------

    @Override
    @Transactional
    public ComplaintResponse create(Long reporterId, CreateComplaintRequest request) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Complaint complaint = newComplaint(request);
        complaint.setReporter(reporter);
        return ComplaintResponse.from(complaintRepository.save(complaint));
    }

    @Override
    @Transactional
    public ComplaintTrackResponse createAsGuest(CreateComplaintRequest request) {
        Complaint complaint = newComplaint(request);
        complaint.setReporterName(blankToNull(request.reporterName()));
        complaint.setReporterPhone(blankToNull(request.reporterPhone()));
        return ComplaintTrackResponse.from(complaintRepository.save(complaint));
    }

    // Checks the location and photo, then fills in the common fields
    private Complaint newComplaint(CreateComplaintRequest request) {
        Point location = GeoUtils.toPoint(request.latitude(), request.longitude());
        // PostGIS finds the ward from the map location
        Ward ward = wardRepository.findWardContaining(location.getY(), location.getX())
                .orElseThrow(() -> new BadRequestException(
                        "This location is outside all council wards we serve. Please check the map pin."));

        String photo = blankToNull(request.photoFileName());
        if (photo != null && !fileStorageService.exists(photo)) {
            throw new BadRequestException("Photo not found. Please upload it again.");
        }

        Complaint complaint = new Complaint();
        complaint.setTrackingCode(newTrackingCode());
        complaint.setCategory(request.category());
        complaint.setDescription(request.description().trim());
        complaint.setLandmark(blankToNull(request.landmark()));
        complaint.setLocation(location);
        complaint.setWard(ward);
        complaint.setPhotoFileName(photo);
        complaint.setCreatedAt(Instant.now());
        complaint.applyPriority(request.category().getDefaultPriority());
        return complaint;
    }

    @Override
    public List<ComplaintResponse> getMine(Long userId) {
        return complaintRepository.findByReporterIdOrderByCreatedAtDesc(userId).stream()
                .map(ComplaintResponse::from)
                .toList();
    }

    @Override
    public ComplaintTrackResponse track(String trackingCode) {
        String code = trackingCode.trim().toUpperCase(Locale.ROOT);
        return complaintRepository.findByTrackingCode(code)
                .map(ComplaintTrackResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("No complaint found with this code"));
    }

    // ---------- Council officer / admin ----------

    @Override
    public List<ComplaintResponse> getAll(Long userId, ComplaintStatus status, boolean assignedToMe) {
        List<Complaint> complaints = assignedToMe
                ? complaintRepository.findByAssignedOfficerIdOrderByCreatedAtDesc(userId)
                : complaintRepository.findAllByOrderByCreatedAtDesc();
        return complaints.stream()
                .filter(c -> status == null || c.getStatus() == status)
                .map(ComplaintResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ComplaintResponse assign(Long complaintId, AssignOfficerRequest request) {
        Complaint complaint = find(complaintId);
        requireOpen(complaint);
        User officer = userRepository.findById(request.officerId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found"));
        if (officer.getRole() != Role.COUNCIL_OFFICER || !officer.isEnabled()) {
            throw new BadRequestException("Choose an active council officer");
        }
        if (request.priority() != null) {
            complaint.applyPriority(request.priority());
        }
        complaint.setAssignedOfficer(officer);
        complaint.setAssignedAt(Instant.now());
        // A complaint already being worked on stays "in progress" when it moves to another officer
        if (complaint.getStatus() == ComplaintStatus.OPEN) {
            complaint.setStatus(ComplaintStatus.ASSIGNED);
        }
        return ComplaintResponse.from(complaint);
    }

    @Override
    @Transactional
    public ComplaintResponse start(Long userId, boolean admin, Long complaintId) {
        Complaint complaint = find(complaintId);
        requireAssignedOfficer(complaint, userId, admin);
        requireStatus(complaint, Set.of(ComplaintStatus.ASSIGNED), "Only assigned complaints can be started");
        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        complaint.setStartedAt(Instant.now());
        return ComplaintResponse.from(complaint);
    }

    @Override
    @Transactional
    public ComplaintResponse resolve(Long userId, boolean admin, Long complaintId, ComplaintNoteRequest request) {
        Complaint complaint = find(complaintId);
        requireAssignedOfficer(complaint, userId, admin);
        requireStatus(complaint, Set.of(ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS),
                "Assign the complaint to an officer first");
        Instant now = Instant.now();
        if (complaint.getStartedAt() == null) {
            complaint.setStartedAt(now);
        }
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResolvedAt(now);
        complaint.setResolutionNote(request.note().trim());
        return ComplaintResponse.from(complaint);
    }

    @Override
    @Transactional
    public ComplaintResponse reject(Long complaintId, ComplaintNoteRequest request) {
        Complaint complaint = find(complaintId);
        requireOpen(complaint);
        complaint.setStatus(ComplaintStatus.REJECTED);
        complaint.setResolvedAt(Instant.now());
        complaint.setResolutionNote(request.note().trim());
        return ComplaintResponse.from(complaint);
    }

    // ---------- Shared ----------

    @Override
    public ComplaintResponse getById(Long userId, boolean staff, Long complaintId) {
        Complaint complaint = find(complaintId);
        boolean owner = complaint.getReporter() != null && complaint.getReporter().getId().equals(userId);
        if (!staff && !owner) {
            throw new AccessDeniedException("Not your complaint");
        }
        return ComplaintResponse.from(complaint);
    }

    // ---------- Helpers ----------

    private Complaint find(Long complaintId) {
        return complaintRepository.findWithDetailsById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
    }

    private void requireOpen(Complaint complaint) {
        if (complaint.getStatus().isClosed()) {
            throw new BadRequestException("This complaint is already closed");
        }
    }

    private void requireStatus(Complaint complaint, Set<ComplaintStatus> allowed, String message) {
        if (!allowed.contains(complaint.getStatus())) {
            throw new BadRequestException(message);
        }
    }

    private void requireAssignedOfficer(Complaint complaint, Long userId, boolean admin) {
        User officer = complaint.getAssignedOfficer();
        boolean assignedToMe = officer != null && officer.getId().equals(userId);
        if (!admin && !assignedToMe) {
            throw new AccessDeniedException("This complaint is assigned to another officer");
        }
    }

    private String newTrackingCode() {
        String code;
        do {
            StringBuilder builder = new StringBuilder("CMP-");
            for (int i = 0; i < CODE_LENGTH; i++) {
                builder.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            code = builder.toString();
        } while (complaintRepository.existsByTrackingCode(code));
        return code;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}