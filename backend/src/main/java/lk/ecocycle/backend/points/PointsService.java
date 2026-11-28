package lk.ecocycle.backend.points;

import lk.ecocycle.backend.points.dto.CardResponse;
import lk.ecocycle.backend.points.dto.PointsSummary;
import lk.ecocycle.backend.points.dto.TransactionResponse;
import lk.ecocycle.backend.recycling.DropOff;
import lk.ecocycle.backend.reward.RewardRedemption;
import lk.ecocycle.backend.user.User;

import java.util.List;

public interface PointsService {

    // ----- Household -----

    // The household's QR card (made the first time it is asked for)
    CardResponse getMyCard(Long userId);

    // New code if the old QR code was lost or shared. The old code stops working.
    CardResponse regenerateMyCard(Long userId);

    PointsSummary getSummary(Long userId);

    List<TransactionResponse> getHistory(Long userId);

    // ----- Used by other services -----

    // Centre operator scanned a QR code: whose card is it?
    User findHouseholdByCode(String code);

    // Add the points of a drop-off to the household's balance
    void credit(DropOff dropOff);

    // Take points for a reward. Fails when the balance is too low.
    void debit(User household, RewardRedemption redemption);
}