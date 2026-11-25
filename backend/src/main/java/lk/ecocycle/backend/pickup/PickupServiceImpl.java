package lk.ecocycle.backend.pickup;

import lk.ecocycle.backend.address.Address;
import lk.ecocycle.backend.address.AddressRepository;
import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.pickup.dto.ApprovePickupRequest;
import lk.ecocycle.backend.pickup.dto.AssignDriverRequest;
import lk.ecocycle.backend.pickup.dto.CreatePickupRequest;
import lk.ecocycle.backend.pickup.dto.PickupResponse;
import lk.ecocycle.backend.pickup.dto.RejectPickupRequest;
import lk.ecocycle.backend.storage.FileStorageService;
import lk.ecocycle.backend.user.Role;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import lk.ecocycle.backend.wastetype.WasteType;
import lk.ecocycle.backend.wastetype.WasteTypeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class PickupServiceImpl implements PickupService {

    private static final ZoneId SRI_LANKA = ZoneId.of("Asia/Colombo");
    private static final int MAX_DAYS_AHEAD = 60;

    private final PickupRequestRepository pickupRepository;
    private final AddressRepository addressRepository;
    private final WasteTypeRepository wasteTypeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public PickupServiceImpl(PickupRequestRepository pickupRepository,
                             AddressRepository addressRepository,
                             WasteTypeRepository wasteTypeRepository,
                             UserRepository userRepository,
                             FileStorageService fileStorageService) {
        this.pickupRepository = pickupRepository;
        this.addressRepository = addressRepository;
        this.wasteTypeRepository = wasteTypeRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    // ---------- Household ----------

    @Override
    @Transactional
    public PickupResponse create(Long userId, CreatePickupRequest request) {
        Address address = addressRepository.findByIdAndUserId(request.addressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (address.getWard() == null) {
            throw new BadRequestException("This address is outside all council wards we serve");
        }
        WasteType wasteType = wasteTypeRepository.findById(request.wasteTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found"));

        LocalDate today = today();
        if (!request.preferredDate().isAfter(today)) {
            throw new BadRequestException("Preferred date must be from tomorrow onwards");
        }
        if (request.preferredDate().isAfter(today.plusDays(MAX_DAYS_AHEAD))) {
            throw new BadRequestException("Preferred date must be within the next " + MAX_DAYS_AHEAD + " days");
        }

        String photo = blankToNull(request.photoFileName());
        if (photo != null && !fileStorageService.exists(photo)) {
            throw new BadRequestException("Photo not found. Please upload it again.");
        }

        PickupRequest pickup = new PickupRequest();
        pickup.setRequester(address.getUser());
        pickup.setWard(address.getWard());
        pickup.setWasteType(wasteType);
        pickup.setAddressText(address.getAddressLine() + ", " + address.getCity());
        pickup.setLocation(address.getLocation());
        pickup.setDescription(request.description().trim());
        pickup.setPreferredDate(request.preferredDate());
        pickup.setPhotoFileName(photo);
        return PickupResponse.from(pickupRepository.save(pickup));
    }

    @Override
    public List<PickupResponse> getMine(Long userId) {
        return pickupRepository.findByRequesterIdOrderByCreatedAtDesc(userId).stream()
                .map(PickupResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public PickupResponse cancel(Long userId, Long requestId) {
        PickupRequest pickup = find(requestId);
        if (!pickup.getRequester().getId().equals(userId)) {
            throw new ResourceNotFoundException("Pickup request not found");
        }
        requireStatus(pickup, Set.of(PickupStatus.PENDING, PickupStatus.APPROVED),
                "Only pending or approved requests can be cancelled");
        pickup.setStatus(PickupStatus.CANCELLED);
        return PickupResponse.from(pickup);
    }

    // ---------- Council officer / admin ----------

    @Override
    public List<PickupResponse> getAll(PickupStatus status) {
        List<PickupRequest> requests = status == null
                ? pickupRepository.findAllByOrderByCreatedAtDesc()
                : pickupRepository.findByStatusOrderByCreatedAtDesc(status);
        return requests.stream().map(PickupResponse::from).toList();
    }

    @Override
    @Transactional
    public PickupResponse approve(Long requestId, ApprovePickupRequest request) {
        PickupRequest pickup = find(requestId);
        requireStatus(pickup, Set.of(PickupStatus.PENDING), "Only pending requests can be approved");
        if (request.scheduledDate().isBefore(today())) {
            throw new BadRequestException("Collection date cannot be in the past");
        }
        pickup.setStatus(PickupStatus.APPROVED);
        pickup.setScheduledDate(request.scheduledDate());
        pickup.setStaffNote(blankToNull(request.note()));
        return PickupResponse.from(pickup);
    }

    @Override
    @Transactional
    public PickupResponse reject(Long requestId, RejectPickupRequest request) {
        PickupRequest pickup = find(requestId);
        requireStatus(pickup, Set.of(PickupStatus.PENDING, PickupStatus.APPROVED, PickupStatus.ASSIGNED),
                "This request is already closed");
        pickup.setStatus(PickupStatus.REJECTED);
        pickup.setRejectionReason(request.reason().trim());
        return PickupResponse.from(pickup);
    }

    @Override
    @Transactional
    public PickupResponse assignDriver(Long requestId, AssignDriverRequest request) {
        PickupRequest pickup = find(requestId);
        // ASSIGNED is allowed too, so the officer can change the driver
        requireStatus(pickup, Set.of(PickupStatus.APPROVED, PickupStatus.ASSIGNED),
                "Approve the request before assigning a driver");
        User driver = userRepository.findById(request.driverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        if (driver.getRole() != Role.DRIVER || !driver.isEnabled()) {
            throw new BadRequestException("Choose an active driver");
        }
        pickup.setAssignedDriver(driver);
        pickup.setStatus(PickupStatus.ASSIGNED);
        return PickupResponse.from(pickup);
    }

    // ---------- Driver ----------

    @Override
    public List<PickupResponse> getAssignedTo(Long driverId) {
        return pickupRepository.findByAssignedDriverIdAndStatusOrderByScheduledDateAsc(driverId, PickupStatus.ASSIGNED)
                .stream()
                .map(PickupResponse::from)
                .toList();
    }

    // ---------- Shared ----------

    @Override
    public PickupResponse getById(Long userId, boolean staff, Long requestId) {
        PickupRequest pickup = find(requestId);
        boolean owner = pickup.getRequester().getId().equals(userId);
        if (!staff && !owner && !isAssignedDriver(pickup, userId)) {
            throw new AccessDeniedException("Not your pickup request");
        }
        return PickupResponse.from(pickup);
    }

    @Override
    @Transactional
    public PickupResponse complete(Long userId, boolean staff, Long requestId) {
        PickupRequest pickup = find(requestId);
        if (!staff && !isAssignedDriver(pickup, userId)) {
            throw new AccessDeniedException("This pickup is not assigned to you");
        }
        requireStatus(pickup, Set.of(PickupStatus.ASSIGNED), "Only assigned pickups can be completed");
        pickup.setStatus(PickupStatus.COMPLETED);
        pickup.setCompletedAt(Instant.now());
        return PickupResponse.from(pickup);
    }

    // ---------- Helpers ----------

    private PickupRequest find(Long requestId) {
        return pickupRepository.findWithDetailsById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup request not found"));
    }

    private void requireStatus(PickupRequest pickup, Set<PickupStatus> allowed, String message) {
        if (!allowed.contains(pickup.getStatus())) {
            throw new BadRequestException(message);
        }
    }

    private boolean isAssignedDriver(PickupRequest pickup, Long userId) {
        return pickup.getAssignedDriver() != null && pickup.getAssignedDriver().getId().equals(userId);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private LocalDate today() {
        return LocalDate.now(SRI_LANKA);
    }
}