package lk.ecocycle.backend.recycling;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface DropOffRepository extends JpaRepository<DropOff, Long> {

    // Items are loaded separately (see DropOffServiceImpl.toResponses) to avoid
    // joining two lists in one query
    @EntityGraph(attributePaths = {"household", "centre", "operator", "reviewedBy"})
    Optional<DropOff> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"household", "centre", "operator", "reviewedBy"})
    List<DropOff> findByHouseholdIdOrderByCreatedAtDesc(Long householdId);

    @EntityGraph(attributePaths = {"household", "centre", "operator", "reviewedBy"})
    List<DropOff> findTop20ByOperatorIdOrderByCreatedAtDesc(Long operatorId);

    @EntityGraph(attributePaths = {"household", "centre", "operator", "reviewedBy"})
    List<DropOff> findByStatusOrderByCreatedAtAsc(DropOffStatus status);

    // How many drop-offs a household made since a time (e.g. since midnight)
    long countByHouseholdIdAndCreatedAtAfter(Long householdId, Instant since);

    @Query("select coalesce(sum(d.totalPoints), 0) from DropOff d "
            + "where d.household.id = :householdId and d.status = :status")
    long sumPointsByHouseholdAndStatus(@Param("householdId") Long householdId,
                                       @Param("status") DropOffStatus status);

    boolean existsByReceiptNumber(String receiptNumber);
}