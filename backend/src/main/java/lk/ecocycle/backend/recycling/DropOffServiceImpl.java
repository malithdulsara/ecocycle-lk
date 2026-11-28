package lk.ecocycle.backend.recycling;

import lk.ecocycle.backend.common.CodeGenerator;
import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.points.PointsService;
import lk.ecocycle.backend.recycling.dto.DropOffItemRequest;
import lk.ecocycle.backend.recycling.dto.DropOffItemResponse;
import lk.ecocycle.backend.recycling.dto.DropOffPreview;
import lk.ecocycle.backend.recycling.dto.DropOffRequest;
import lk.ecocycle.backend.recycling.dto.DropOffResponse;
import lk.ecocycle.backend.recycling.dto.HouseholdLookup;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import lk.ecocycle.backend.wastetype.WasteType;
import lk.ecocycle.backend.wastetype.WasteTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DropOffServiceImpl implements DropOffService {

    private static final ZoneId SRI_LANKA = ZoneId.of("Asia/Colombo");

    // Fraud check: drop-offs above these limits wait for a recycler manager
    private static final BigDecimal REVIEW_WEIGHT_KG = new BigDecimal("50");
    private static final int REVIEW_POINTS = 1000;
    private static final int REVIEW_VISITS_PER_DAY = 3;

    private final DropOffRepository dropOffRepository;
    private final DropOffItemRepository itemRepository;
    private final CollectionCentreRepository centreRepository;
    private final MaterialRateRepository rateRepository;
    private final CampaignRepository campaignRepository;
    private final WasteTypeRepository wasteTypeRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    public DropOffServiceImpl(DropOffRepository dropOffRepository,
                              DropOffItemRepository itemRepository,
                              CollectionCentreRepository centreRepository,
                              MaterialRateRepository rateRepository,
                              CampaignRepository campaignRepository,
                              WasteTypeRepository wasteTypeRepository,
                              UserRepository userRepository,
                              PointsService pointsService) {
        this.dropOffRepository = dropOffRepository;
        this.itemRepository = itemRepository;
        this.centreRepository = centreRepository;
        this.rateRepository = rateRepository;
        this.campaignRepository = campaignRepository;
        this.wasteTypeRepository = wasteTypeRepository;
        this.userRepository = userRepository;
        this.pointsService = pointsService;
    }

    // One material with its points worked out
    private record Line(WasteType wasteType, BigDecimal weightKg, BigDecimal pointsPerKg,
                        BigDecimal multiplier, Campaign campaign, int points) {

        DropOffItemResponse toResponse() {
            return new DropOffItemResponse(wasteType.getId(), wasteType.getName(), wasteType.getColor(),
                    weightKg, pointsPerKg, multiplier, campaign == null ? null : campaign.getName(), points);
        }
    }

    // The whole drop-off worked out
    private record Calculation(User household, List<Line> lines, BigDecimal totalWeightKg, int totalPoints,
                               String reviewReason) {
    }

    // ---------- Centre operator ----------

    @Override
    public HouseholdLookup lookup(String cardCode) {
        User household = pointsService.findHouseholdByCode(cardCode);
        return new HouseholdLookup(cardCode.trim().toUpperCase(), household.getFullName(),
                dropOffRepository.countByHouseholdIdAndCreatedAtAfter(household.getId(), startOfToday()));
    }

    @Override
    public DropOffPreview preview(DropOffRequest request) {
        Calculation calc = calculate(request);
        return new DropOffPreview(calc.household().getFullName(),
                calc.lines().stream().map(Line::toResponse).toList(),
                calc.totalWeightKg(), calc.totalPoints(), calc.reviewReason() != null, calc.reviewReason());
    }

    @Override
    @Transactional
    public DropOffResponse create(Long operatorId, DropOffRequest request) {
        CollectionCentre centre = centreRepository.findById(request.centreId())
                .orElseThrow(() -> new ResourceNotFoundException("Centre not found"));
        if (!centre.isActive()) {
            throw new BadRequestException("This centre is closed");
        }
        Calculation calc = calculate(request);

        DropOff dropOff = new DropOff();
        dropOff.setReceiptNumber(newReceiptNumber());
        dropOff.setHousehold(calc.household());
        dropOff.setCentre(centre);
        dropOff.setOperator(userRepository.getReferenceById(operatorId));
        dropOff.setTotalWeightKg(calc.totalWeightKg());
        dropOff.setTotalPoints(calc.totalPoints());
        dropOff.setStatus(calc.reviewReason() == null ? DropOffStatus.CREDITED : DropOffStatus.PENDING_REVIEW);
        dropOff.setReviewReason(calc.reviewReason());
        for (Line line : calc.lines()) {
            DropOffItem item = new DropOffItem();
            item.setWasteType(line.wasteType());
            item.setWeightKg(line.weightKg());
            item.setPointsPerKg(line.pointsPerKg());
            item.setMultiplier(line.multiplier());
            item.setCampaign(line.campaign());
            item.setPoints(line.points());
            dropOff.addItem(item);
        }
        dropOffRepository.save(dropOff);

        if (dropOff.getStatus() == DropOffStatus.CREDITED) {
            pointsService.credit(dropOff);
        }
        return toResponse(dropOffRepository.findWithDetailsById(dropOff.getId()).orElseThrow());
    }

    @Override
    public List<DropOffResponse> getRecent(Long operatorId) {
        return toResponses(dropOffRepository.findTop20ByOperatorIdOrderByCreatedAtDesc(operatorId));
    }

    // ---------- Household ----------

    @Override
    public List<DropOffResponse> getMine(Long householdId) {
        return toResponses(dropOffRepository.findByHouseholdIdOrderByCreatedAtDesc(householdId));
    }

    // ---------- Recycler manager / admin ----------

    @Override
    public List<DropOffResponse> getPendingReview() {
        return toResponses(dropOffRepository.findByStatusOrderByCreatedAtAsc(DropOffStatus.PENDING_REVIEW));
    }

    @Override
    @Transactional
    public DropOffResponse approve(Long reviewerId, Long dropOffId, String note) {
        DropOff dropOff = findPending(dropOffId);
        markReviewed(dropOff, reviewerId, note, DropOffStatus.CREDITED);
        pointsService.credit(dropOff);
        return toResponse(dropOff);
    }

    @Override
    @Transactional
    public DropOffResponse reject(Long reviewerId, Long dropOffId, String note) {
        if (note == null || note.isBlank()) {
            throw new BadRequestException("Say why the drop-off is rejected");
        }
        DropOff dropOff = findPending(dropOffId);
        markReviewed(dropOff, reviewerId, note, DropOffStatus.REJECTED);
        return toResponse(dropOff);
    }

    // ---------- Points ----------

    private Calculation calculate(DropOffRequest request) {
        User household = pointsService.findHouseholdByCode(request.cardCode());

        Set<Long> seen = new HashSet<>();
        for (DropOffItemRequest item : request.items()) {
            if (!seen.add(item.wasteTypeId())) {
                throw new BadRequestException("Add each material only once");
            }
        }

        Map<Long, MaterialRate> rates = rateRepository.findAllBy().stream()
                .collect(Collectors.toMap(r -> r.getWasteType().getId(), Function.identity()));
        LocalDate today = LocalDate.now(SRI_LANKA);
        List<Campaign> campaigns = campaignRepository
                .findByActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAsc(today, today);

        List<Line> lines = new ArrayList<>();
        BigDecimal totalWeight = BigDecimal.ZERO;
        int totalPoints = 0;
        for (DropOffItemRequest item : request.items()) {
            WasteType wasteType = wasteTypeRepository.findById(item.wasteTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Material not found"));
            MaterialRate rate = rates.get(wasteType.getId());
            if (rate == null) {
                throw new BadRequestException(wasteType.getName() + " does not earn points");
            }
            // If two campaigns run for the same material, the bigger multiplier wins
            Campaign campaign = campaigns.stream()
                    .filter(c -> c.appliesTo(wasteType.getId(), today))
                    .max(Comparator.comparing(Campaign::getMultiplier))
                    .orElse(null);
            BigDecimal multiplier = campaign == null ? BigDecimal.ONE.setScale(1) : campaign.getMultiplier();
            int points = PointsCalculator.points(item.weightKg(), rate.getPointsPerKg(), multiplier);

            lines.add(new Line(wasteType, item.weightKg(), rate.getPointsPerKg(), multiplier, campaign, points));
            totalWeight = totalWeight.add(item.weightKg());
            totalPoints += points;
        }

        return new Calculation(household, lines, totalWeight, totalPoints,
                reviewReason(household, totalWeight, totalPoints));
    }

    // Why this drop-off needs a person to check it (null = it does not)
    private String reviewReason(User household, BigDecimal totalWeight, int totalPoints) {
        List<String> reasons = new ArrayList<>();
        if (totalWeight.compareTo(REVIEW_WEIGHT_KG) > 0) {
            reasons.add("more than " + REVIEW_WEIGHT_KG + " kg");
        }
        if (totalPoints > REVIEW_POINTS) {
            reasons.add(String.format("more than %,d points", REVIEW_POINTS));
        }
        long visitsToday = dropOffRepository.countByHouseholdIdAndCreatedAtAfter(household.getId(), startOfToday());
        if (visitsToday + 1 >= REVIEW_VISITS_PER_DAY) {
            reasons.add("visit number " + (visitsToday + 1) + " today");
        }
        if (reasons.isEmpty()) {
            return null;
        }
        String text = String.join(", ", reasons);
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }

    // ---------- Helpers ----------

    private DropOff findPending(Long dropOffId) {
        DropOff dropOff = dropOffRepository.findWithDetailsById(dropOffId)
                .orElseThrow(() -> new ResourceNotFoundException("Drop-off not found"));
        if (dropOff.getStatus() != DropOffStatus.PENDING_REVIEW) {
            throw new BadRequestException("This drop-off has already been reviewed");
        }
        return dropOff;
    }

    private void markReviewed(DropOff dropOff, Long reviewerId, String note, DropOffStatus status) {
        dropOff.setStatus(status);
        dropOff.setReviewNote(note == null || note.isBlank() ? null : note.trim());
        dropOff.setReviewedBy(userRepository.findById(reviewerId).orElseThrow());
        dropOff.setReviewedAt(Instant.now());
    }

    private DropOffResponse toResponse(DropOff dropOff) {
        return toResponses(List.of(dropOff)).getFirst();
    }

    // Loads the items of all drop-offs in one query
    private List<DropOffResponse> toResponses(List<DropOff> dropOffs) {
        if (dropOffs.isEmpty()) {
            return List.of();
        }
        Map<Long, List<DropOffItemResponse>> itemsByDropOff = itemRepository
                .findByDropOffIdInOrderByIdAsc(dropOffs.stream().map(DropOff::getId).toList()).stream()
                .collect(Collectors.groupingBy(item -> item.getDropOff().getId(),
                        Collectors.mapping(DropOffItemResponse::from, Collectors.toList())));
        return dropOffs.stream()
                .map(d -> DropOffResponse.from(d, itemsByDropOff.getOrDefault(d.getId(), List.of())))
                .toList();
    }

    private Instant startOfToday() {
        return LocalDate.now(SRI_LANKA).atStartOfDay(SRI_LANKA).toInstant();
    }

    private String newReceiptNumber() {
        String number;
        do {
            number = CodeGenerator.generate("RCP");
        } while (dropOffRepository.existsByReceiptNumber(number));
        return number;
    }
}