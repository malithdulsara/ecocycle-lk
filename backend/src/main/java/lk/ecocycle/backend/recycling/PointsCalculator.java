package lk.ecocycle.backend.recycling;

import java.math.BigDecimal;
import java.math.RoundingMode;

// points = floor(weight x rate x multiplier)
public final class PointsCalculator {

    private PointsCalculator() {
    }

    // 2.35 kg x 10 points/kg x 1.5 = 35.25 -> 35 points
    public static int points(BigDecimal weightKg, BigDecimal pointsPerKg, BigDecimal multiplier) {
        return weightKg.multiply(pointsPerKg)
                .multiply(multiplier)
                .setScale(0, RoundingMode.FLOOR)
                .intValueExact();
    }
}