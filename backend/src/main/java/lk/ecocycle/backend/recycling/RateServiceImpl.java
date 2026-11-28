package lk.ecocycle.backend.recycling;

import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.recycling.dto.CampaignRequest;
import lk.ecocycle.backend.recycling.dto.CampaignResponse;
import lk.ecocycle.backend.recycling.dto.RateRequest;
import lk.ecocycle.backend.recycling.dto.RateResponse;
import lk.ecocycle.backend.wastetype.WasteType;
import lk.ecocycle.backend.wastetype.WasteTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class RateServiceImpl implements RateService {

    private static final ZoneId SRI_LANKA = ZoneId.of("Asia/Colombo");
    // A campaign can run for at most a year
    private static final int MAX_CAMPAIGN_DAYS = 366;

    private final MaterialRateRepository rateRepository;
    private final CampaignRepository campaignRepository;
    private final WasteTypeRepository wasteTypeRepository;

    public RateServiceImpl(MaterialRateRepository rateRepository,
                           CampaignRepository campaignRepository,
                           WasteTypeRepository wasteTypeRepository) {
        this.rateRepository = rateRepository;
        this.campaignRepository = campaignRepository;
        this.wasteTypeRepository = wasteTypeRepository;
    }

    // ---------- Material rates ----------

    @Override
    @Transactional(readOnly = true)
    public List<RateResponse> getRates() {
        Map<Long, MaterialRate> rates = rateRepository.findAllBy().stream()
                .collect(Collectors.toMap(r -> r.getWasteType().getId(), Function.identity()));
        return wasteTypeRepository.findAllByOrderBySortOrderAsc().stream()
                .filter(WasteType::isRecyclable)
                .map(type -> RateResponse.of(type, rates.get(type.getId())))
                .toList();
    }

    @Override
    public RateResponse setRate(Long wasteTypeId, RateRequest request) {
        WasteType wasteType = findRecyclable(wasteTypeId);
        MaterialRate rate = rateRepository.findByWasteTypeId(wasteTypeId).orElseGet(() -> {
            MaterialRate created = new MaterialRate();
            created.setWasteType(wasteType);
            return created;
        });
        rate.setPointsPerKg(request.pointsPerKg());
        return RateResponse.of(wasteType, rateRepository.save(rate));
    }

    @Override
    public void removeRate(Long wasteTypeId) {
        MaterialRate rate = rateRepository.findByWasteTypeId(wasteTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("This material has no rate"));
        rateRepository.delete(rate);
    }

    // ---------- Campaigns ----------

    @Override
    @Transactional(readOnly = true)
    public List<CampaignResponse> getCampaigns() {
        LocalDate today = today();
        return campaignRepository.findAllByOrderByStartDateDescIdDesc().stream()
                .map(c -> CampaignResponse.from(c, today))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampaignResponse> getRunningCampaigns() {
        LocalDate today = today();
        return campaignRepository
                .findByActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAsc(today, today)
                .stream()
                .map(c -> CampaignResponse.from(c, today))
                .toList();
    }

    @Override
    public CampaignResponse createCampaign(CampaignRequest request) {
        if (request.endDate().isBefore(today())) {
            throw new BadRequestException("End date cannot be in the past");
        }
        Campaign campaign = new Campaign();
        apply(campaign, request);
        return CampaignResponse.from(campaignRepository.save(campaign), today());
    }

    @Override
    public CampaignResponse updateCampaign(Long campaignId, CampaignRequest request) {
        Campaign campaign = campaignRepository.findWithWasteTypeById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));
        apply(campaign, request);
        return CampaignResponse.from(campaign, today());
    }

    private void apply(Campaign campaign, CampaignRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("End date must be on or after the start date");
        }
        if (request.startDate().plusDays(MAX_CAMPAIGN_DAYS).isBefore(request.endDate())) {
            throw new BadRequestException("A campaign can run for at most one year");
        }
        campaign.setName(request.name().trim());
        campaign.setDescription(request.description() == null || request.description().isBlank()
                ? null : request.description().trim());
        campaign.setMultiplier(request.multiplier());
        campaign.setWasteType(request.wasteTypeId() == null ? null : findRecyclable(request.wasteTypeId()));
        campaign.setStartDate(request.startDate());
        campaign.setEndDate(request.endDate());
        if (request.active() != null) {
            campaign.setActive(request.active());
        }
    }

    private WasteType findRecyclable(Long wasteTypeId) {
        WasteType wasteType = wasteTypeRepository.findById(wasteTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found"));
        if (!wasteType.isRecyclable()) {
            throw new BadRequestException(wasteType.getName() + " is not a recyclable material");
        }
        return wasteType;
    }

    private LocalDate today() {
        return LocalDate.now(SRI_LANKA);
    }
}