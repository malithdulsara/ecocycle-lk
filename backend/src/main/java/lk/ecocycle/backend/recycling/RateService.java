package lk.ecocycle.backend.recycling;

import lk.ecocycle.backend.recycling.dto.CampaignRequest;
import lk.ecocycle.backend.recycling.dto.CampaignResponse;
import lk.ecocycle.backend.recycling.dto.RateRequest;
import lk.ecocycle.backend.recycling.dto.RateResponse;

import java.util.List;

// Material rates and campaigns: everything that decides how many points a drop-off is worth
public interface RateService {

    // Every recyclable material, with its rate (or null when not accepted)
    List<RateResponse> getRates();

    RateResponse setRate(Long wasteTypeId, RateRequest request);

    // Stop giving points for this material
    void removeRate(Long wasteTypeId);

    List<CampaignResponse> getCampaigns();

    // Campaigns running today (shown to households)
    List<CampaignResponse> getRunningCampaigns();

    CampaignResponse createCampaign(CampaignRequest request);

    CampaignResponse updateCampaign(Long campaignId, CampaignRequest request);
}