package lk.ecocycle.backend.reward;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RewardRepository extends JpaRepository<Reward, Long> {

    List<Reward> findAllByOrderByPointsCostAscIdAsc();

    List<Reward> findByActiveTrueOrderByPointsCostAscIdAsc();

    // Locks the reward row so the last item in stock cannot be given to two people
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Reward r where r.id = :id")
    Optional<Reward> lockById(@Param("id") Long id);
}