package lk.ecocycle.backend.complaint;

import lk.ecocycle.backend.complaint.dto.AssignOfficerRequest;
import lk.ecocycle.backend.complaint.dto.ComplaintNoteRequest;
import lk.ecocycle.backend.complaint.dto.ComplaintResponse;
import lk.ecocycle.backend.complaint.dto.ComplaintTrackResponse;
import lk.ecocycle.backend.complaint.dto.CreateComplaintRequest;

import java.util.List;

public interface ComplaintService {

    // ----- Household and guest -----

    ComplaintResponse create(Long reporterId, CreateComplaintRequest request);

    // Anonymous complaint without login. Returns only the tracking code and status.
    ComplaintTrackResponse createAsGuest(CreateComplaintRequest request);

    List<ComplaintResponse> getMine(Long userId);

    // Public: anyone with the tracking code
    ComplaintTrackResponse track(String trackingCode);

    // ----- Council officer / admin -----

    // status = null means all. assignedToMe = only the ones given to this officer.
    List<ComplaintResponse> getAll(Long userId, ComplaintStatus status, boolean assignedToMe);

    ComplaintResponse assign(Long complaintId, AssignOfficerRequest request);

    // Only the assigned officer or an admin can start / resolve
    ComplaintResponse start(Long userId, boolean admin, Long complaintId);

    ComplaintResponse resolve(Long userId, boolean admin, Long complaintId, ComplaintNoteRequest request);

    ComplaintResponse reject(Long complaintId, ComplaintNoteRequest request);

    // ----- Shared -----

    // staff = admin or council officer. A household can only see its own complaints.
    ComplaintResponse getById(Long userId, boolean staff, Long complaintId);
}