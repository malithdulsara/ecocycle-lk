package lk.ecocycle.backend.recycling;

import lk.ecocycle.backend.recycling.dto.DropOffPreview;
import lk.ecocycle.backend.recycling.dto.DropOffRequest;
import lk.ecocycle.backend.recycling.dto.DropOffResponse;
import lk.ecocycle.backend.recycling.dto.HouseholdLookup;

import java.util.List;

public interface DropOffService {

    // ----- Centre operator -----

    HouseholdLookup lookup(String cardCode);

    // Work out the points without saving anything
    DropOffPreview preview(DropOffRequest request);

    // Save the drop-off. Points are added now, or after a review for unusual drop-offs.
    DropOffResponse create(Long operatorId, DropOffRequest request);

    // The operator's last 20 drop-offs
    List<DropOffResponse> getRecent(Long operatorId);

    // ----- Household -----

    List<DropOffResponse> getMine(Long householdId);

    // ----- Recycler manager / admin -----

    List<DropOffResponse> getPendingReview();

    DropOffResponse approve(Long reviewerId, Long dropOffId, String note);

    DropOffResponse reject(Long reviewerId, Long dropOffId, String note);
}