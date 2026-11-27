package lk.ecocycle.backend.tracking.dto;

import java.time.Instant;

public record TrailPoint(double latitude, double longitude, Instant recordedAt) {
}