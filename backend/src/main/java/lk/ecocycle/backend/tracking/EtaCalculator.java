package lk.ecocycle.backend.tracking;

// Rough arrival time. Roads are not straight, and a garbage truck stops a lot,
// so we add 30% to the straight-line distance and use a slow average speed.
public final class EtaCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double ROAD_FACTOR = 1.3;
    private static final double AVERAGE_SPEED_KMH = 15.0;

    private EtaCalculator() {
    }

    // Straight-line distance between two GPS points (haversine formula)
    public static double distanceKm(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public static int etaMinutes(double distanceKm) {
        return (int) Math.ceil(distanceKm * ROAD_FACTOR / AVERAGE_SPEED_KMH * 60);
    }
}