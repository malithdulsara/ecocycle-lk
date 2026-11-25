package lk.ecocycle.backend.pickup;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {

    // @EntityGraph loads the related rows in the same query (no extra query per request)

    @EntityGraph(attributePaths = {"wasteType", "ward", "ward.council", "requester", "assignedDriver"})
    Optional<PickupRequest> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"wasteType", "ward", "ward.council", "requester", "assignedDriver"})
    List<PickupRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    @EntityGraph(attributePaths = {"wasteType", "ward", "ward.council", "requester", "assignedDriver"})
    List<PickupRequest> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"wasteType", "ward", "ward.council", "requester", "assignedDriver"})
    List<PickupRequest> findByStatusOrderByCreatedAtDesc(PickupStatus status);

    @EntityGraph(attributePaths = {"wasteType", "ward", "ward.council", "requester", "assignedDriver"})
    List<PickupRequest> findByAssignedDriverIdAndStatusOrderByScheduledDateAsc(Long driverId, PickupStatus status);
}