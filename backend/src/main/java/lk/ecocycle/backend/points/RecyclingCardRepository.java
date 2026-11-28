package lk.ecocycle.backend.points;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RecyclingCardRepository extends JpaRepository<RecyclingCard, Long> {

    @EntityGraph(attributePaths = "user")
    Optional<RecyclingCard> findByCode(String code);

    boolean existsByCode(String code);

    // Locks the card row until the transaction ends, so two payments from
    // the same balance at the same moment cannot both go through
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from RecyclingCard c where c.userId = :userId")
    Optional<RecyclingCard> lockByUserId(@Param("userId") Long userId);
}