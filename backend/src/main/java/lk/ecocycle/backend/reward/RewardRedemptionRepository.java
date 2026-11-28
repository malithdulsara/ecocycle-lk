package lk.ecocycle.backend.reward;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {

    @EntityGraph(attributePaths = {"reward", "user"})
    List<RewardRedemption> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"reward", "user"})
    List<RewardRedemption> findTop100ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"reward", "user"})
    Optional<RewardRedemption> findByVoucherCode(String voucherCode);

    boolean existsByVoucherCode(String voucherCode);
}