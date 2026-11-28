package lk.ecocycle.backend.reward;

import lk.ecocycle.backend.common.CodeGenerator;
import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.points.PointsService;
import lk.ecocycle.backend.reward.dto.RedemptionResponse;
import lk.ecocycle.backend.reward.dto.RewardRequest;
import lk.ecocycle.backend.reward.dto.RewardResponse;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class RewardServiceImpl implements RewardService {

    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    public RewardServiceImpl(RewardRepository rewardRepository,
                             RewardRedemptionRepository redemptionRepository,
                             UserRepository userRepository,
                             PointsService pointsService) {
        this.rewardRepository = rewardRepository;
        this.redemptionRepository = redemptionRepository;
        this.userRepository = userRepository;
        this.pointsService = pointsService;
    }

    // ---------- Catalogue ----------

    @Override
    @Transactional(readOnly = true)
    public List<RewardResponse> getActive() {
        return rewardRepository.findByActiveTrueOrderByPointsCostAscIdAsc().stream()
                .map(RewardResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RewardResponse> getAll() {
        return rewardRepository.findAllByOrderByPointsCostAscIdAsc().stream()
                .map(RewardResponse::from)
                .toList();
    }

    @Override
    public RewardResponse create(RewardRequest request) {
        Reward reward = new Reward();
        apply(reward, request);
        return RewardResponse.from(rewardRepository.save(reward));
    }

    @Override
    public RewardResponse update(Long rewardId, RewardRequest request) {
        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found"));
        apply(reward, request);
        return RewardResponse.from(reward);
    }

    private void apply(Reward reward, RewardRequest request) {
        reward.setName(request.name().trim());
        reward.setDescription(request.description() == null || request.description().isBlank()
                ? null : request.description().trim());
        reward.setPointsCost(request.pointsCost());
        reward.setStock(request.stock());
        if (request.active() != null) {
            reward.setActive(request.active());
        }
    }

    // ---------- Redeem ----------

    @Override
    public RedemptionResponse redeem(Long userId, Long rewardId) {
        Reward reward = rewardRepository.lockById(rewardId)
                .filter(Reward::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found"));
        if (reward.getStock() != null && reward.getStock() <= 0) {
            throw new BadRequestException("Sorry, this reward is out of stock");
        }
        User household = userRepository.findById(userId).orElseThrow();

        RewardRedemption redemption = new RewardRedemption();
        redemption.setReward(reward);
        redemption.setUser(household);
        redemption.setPoints(reward.getPointsCost());
        redemption.setVoucherCode(newVoucherCode());
        redemptionRepository.save(redemption);

        // Throws (and undoes everything above) when the balance is too low
        pointsService.debit(household, redemption);

        if (reward.getStock() != null) {
            reward.setStock(reward.getStock() - 1);
        }
        return RedemptionResponse.from(redemption);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RedemptionResponse> getMyRedemptions(Long userId) {
        return redemptionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(RedemptionResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RedemptionResponse> getAllRedemptions() {
        return redemptionRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(RedemptionResponse::from)
                .toList();
    }

    @Override
    public RedemptionResponse collect(String voucherCode) {
        RewardRedemption redemption = redemptionRepository.findByVoucherCode(voucherCode.trim().toUpperCase(Locale.ROOT))
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
        if (redemption.getStatus() == RedemptionStatus.COLLECTED) {
            throw new BadRequestException("This voucher was already used");
        }
        redemption.setStatus(RedemptionStatus.COLLECTED);
        redemption.setCollectedAt(Instant.now());
        return RedemptionResponse.from(redemption);
    }

    private String newVoucherCode() {
        String code;
        do {
            code = CodeGenerator.generate("VCH");
        } while (redemptionRepository.existsByVoucherCode(code));
        return code;
    }
}