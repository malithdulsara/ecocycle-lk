package lk.ecocycle.backend.points;

import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.points.dto.CardResponse;
import lk.ecocycle.backend.points.dto.PointsSummary;
import lk.ecocycle.backend.points.dto.TransactionResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Household: my QR card, balance and points history
@RestController
@RequestMapping("/api/v1/points")
@PreAuthorize("hasRole('HOUSEHOLD')")
public class PointsController {

    private final PointsService pointsService;

    public PointsController(PointsService pointsService) {
        this.pointsService = pointsService;
    }

    @GetMapping("/me")
    public ApiResponse<PointsSummary> getSummary(Authentication auth) {
        return ApiResponse.ok(pointsService.getSummary(userId(auth)));
    }

    @GetMapping("/me/history")
    public ApiResponse<List<TransactionResponse>> getHistory(Authentication auth) {
        return ApiResponse.ok(pointsService.getHistory(userId(auth)));
    }

    @GetMapping("/me/card")
    public ApiResponse<CardResponse> getCard(Authentication auth) {
        return ApiResponse.ok(pointsService.getMyCard(userId(auth)));
    }

    @PostMapping("/me/card/regenerate")
    public ApiResponse<CardResponse> regenerateCard(Authentication auth) {
        return ApiResponse.ok("New QR code made. The old one no longer works.", pointsService.regenerateMyCard(userId(auth)));
    }

    // The token's "sub" claim is the user id
    private Long userId(Authentication auth) {
        return Long.valueOf(auth.getName());
    }
}