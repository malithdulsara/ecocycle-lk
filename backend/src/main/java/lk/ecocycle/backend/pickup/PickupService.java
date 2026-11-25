package lk.ecocycle.backend.pickup;

import lk.ecocycle.backend.pickup.dto.ApprovePickupRequest;
import lk.ecocycle.backend.pickup.dto.AssignDriverRequest;
import lk.ecocycle.backend.pickup.dto.CreatePickupRequest;
import lk.ecocycle.backend.pickup.dto.PickupResponse;
import lk.ecocycle.backend.pickup.dto.RejectPickupRequest;

import java.util.List;

public interface PickupService {

    // ----- Household -----

    PickupResponse create(Long userId, CreatePickupRequest request);

    List<PickupResponse> getMine(Long userId);

    PickupResponse cancel(Long userId, Long requestId);

    // ----- Council officer / admin -----

    // status = null means all requests
    List<PickupResponse> getAll(PickupStatus status);

    PickupResponse approve(Long requestId, ApprovePickupRequest request);

    PickupResponse reject(Long requestId, RejectPickupRequest request);

    PickupResponse assignDriver(Long requestId, AssignDriverRequest request);

    // ----- Driver -----

    List<PickupResponse> getAssignedTo(Long driverId);

    // ----- Shared -----

    // staff = admin or council officer. Others can only see their own / assigned requests.
    PickupResponse getById(Long userId, boolean staff, Long requestId);

    // The assigned driver (or staff) marks the pickup as done
    PickupResponse complete(Long userId, boolean staff, Long requestId);
}