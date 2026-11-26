package lk.ecocycle.backend.complaint;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    @EntityGraph(attributePaths = {"ward", "ward.council", "reporter", "assignedOfficer"})
    Optional<Complaint> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"ward", "ward.council"})
    Optional<Complaint> findByTrackingCode(String trackingCode);

    @EntityGraph(attributePaths = {"ward", "ward.council", "reporter", "assignedOfficer"})
    List<Complaint> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    @EntityGraph(attributePaths = {"ward", "ward.council", "reporter", "assignedOfficer"})
    List<Complaint> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"ward", "ward.council", "reporter", "assignedOfficer"})
    List<Complaint> findByAssignedOfficerIdOrderByCreatedAtDesc(Long officerId);

    boolean existsByTrackingCode(String trackingCode);
}