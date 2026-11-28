package lk.ecocycle.backend.points;

import lk.ecocycle.backend.common.CodeGenerator;
import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.points.dto.CardResponse;
import lk.ecocycle.backend.points.dto.PointsSummary;
import lk.ecocycle.backend.points.dto.TransactionResponse;
import lk.ecocycle.backend.recycling.DropOff;
import lk.ecocycle.backend.recycling.DropOffRepository;
import lk.ecocycle.backend.recycling.DropOffStatus;
import lk.ecocycle.backend.reward.RewardRedemption;
import lk.ecocycle.backend.user.Role;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class PointsServiceImpl implements PointsService {

    private static final String CARD_PREFIX = "ECO";

    private final RecyclingCardRepository cardRepository;
    private final PointTransactionRepository transactionRepository;
    private final DropOffRepository dropOffRepository;
    private final UserRepository userRepository;

    public PointsServiceImpl(RecyclingCardRepository cardRepository,
                             PointTransactionRepository transactionRepository,
                             DropOffRepository dropOffRepository,
                             UserRepository userRepository) {
        this.cardRepository = cardRepository;
        this.transactionRepository = transactionRepository;
        this.dropOffRepository = dropOffRepository;
        this.userRepository = userRepository;
    }

    // ---------- Household ----------

    @Override
    public CardResponse getMyCard(Long userId) {
        RecyclingCard card = cardRepository.findById(userId).orElseGet(() -> {
            RecyclingCard created = new RecyclingCard();
            created.setUser(userRepository.getReferenceById(userId));
            created.setCode(newCode());
            return cardRepository.save(created);
        });
        return CardResponse.from(card);
    }

    @Override
    public CardResponse regenerateMyCard(Long userId) {
        RecyclingCard card = cardRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("You do not have a recycling card yet"));
        card.setCode(newCode());
        card.setCreatedAt(Instant.now());
        return CardResponse.from(card);
    }

    @Override
    @Transactional(readOnly = true)
    public PointsSummary getSummary(Long userId) {
        return new PointsSummary(
                transactionRepository.balanceOf(userId),
                dropOffRepository.sumPointsByHouseholdAndStatus(userId, DropOffStatus.PENDING_REVIEW),
                transactionRepository.totalEarnedBy(userId)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getHistory(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    // ---------- Used by other services ----------

    @Override
    @Transactional(readOnly = true)
    public User findHouseholdByCode(String code) {
        String cleaned = code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
        User household = cardRepository.findByCode(cleaned)
                .map(RecyclingCard::getUser)
                .orElseThrow(() -> new ResourceNotFoundException("No household has this QR code"));
        if (household.getRole() != Role.HOUSEHOLD || !household.isEnabled()) {
            throw new BadRequestException("This account cannot earn points");
        }
        return household;
    }

    @Override
    public void credit(DropOff dropOff) {
        PointTransaction transaction = new PointTransaction();
        transaction.setUser(dropOff.getHousehold());
        transaction.setType(TransactionType.EARNED);
        transaction.setPoints(dropOff.getTotalPoints());
        transaction.setDescription("Recycled " + dropOff.getTotalWeightKg().stripTrailingZeros().toPlainString()
                + " kg at " + dropOff.getCentre().getName());
        transaction.setDropOff(dropOff);
        transactionRepository.save(transaction);
    }

    @Override
    public void debit(User household, RewardRedemption redemption) {
        // Lock first, then read the balance (see RecyclingCardRepository.lockByUserId)
        cardRepository.lockByUserId(household.getId());
        long balance = transactionRepository.balanceOf(household.getId());
        if (balance < redemption.getPoints()) {
            throw new BadRequestException("You need " + (redemption.getPoints() - balance) + " more points for this reward");
        }
        PointTransaction transaction = new PointTransaction();
        transaction.setUser(household);
        transaction.setType(TransactionType.REDEEMED);
        transaction.setPoints(-redemption.getPoints());
        transaction.setDescription("Redeemed " + redemption.getReward().getName());
        transaction.setRedemption(redemption);
        transactionRepository.save(transaction);
    }

    private String newCode() {
        String code;
        do {
            code = CodeGenerator.generate(CARD_PREFIX);
        } while (cardRepository.existsByCode(code));
        return code;
    }
}