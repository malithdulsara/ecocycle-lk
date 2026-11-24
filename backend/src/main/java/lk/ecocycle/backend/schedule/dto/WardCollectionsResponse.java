package lk.ecocycle.backend.schedule.dto;

import java.util.List;

// The next collections for one ward
public record WardCollectionsResponse(
        Long wardId,
        String wardName,
        String councilName,
        List<UpcomingCollection> collections
) {
}