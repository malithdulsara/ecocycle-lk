package lk.ecocycle.backend.points;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    // Newest first
    @EntityGraph(attributePaths = {"dropOff", "redemption"})
    List<PointTransaction> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    @Query("select coalesce(sum(t.points), 0) from PointTransaction t where t.user.id = :userId")
    long balanceOf(@Param("userId") Long userId);

    @Query("select coalesce(sum(t.points), 0) from PointTransaction t "
            + "where t.user.id = :userId and t.type = lk.ecocycle.backend.points.TransactionType.EARNED")
    long totalEarnedBy(@Param("userId") Long userId);
}