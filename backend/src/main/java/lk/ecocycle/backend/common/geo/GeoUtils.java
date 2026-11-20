package lk.ecocycle.backend.common.geo;

import lk.ecocycle.backend.common.exception.BadRequestException;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.geom.PrecisionModel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// Converts between simple [longitude, latitude] lists (used in JSON) and PostGIS geometry objects
public final class GeoUtils {

    // 4326 = WGS 84, the GPS coordinate system used by Google Maps, OpenStreetMap and phones
    public static final int SRID = 4326;

    // Rough box around Sri Lanka, to catch swapped or wrong coordinates
    private static final double MIN_LAT = 5.8, MAX_LAT = 10.0, MIN_LNG = 79.4, MAX_LNG = 82.0;

    private static final GeometryFactory FACTORY = new GeometryFactory(new PrecisionModel(), SRID);

    private GeoUtils() {
    }

    public static Point toPoint(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new BadRequestException("Latitude and longitude are required");
        }
        if (latitude < MIN_LAT || latitude > MAX_LAT || longitude < MIN_LNG || longitude > MAX_LNG) {
            throw new BadRequestException("Location must be inside Sri Lanka");
        }
        // Note: x = longitude, y = latitude
        return FACTORY.createPoint(new Coordinate(longitude, latitude));
    }

    // boundary = list of [longitude, latitude] pairs going around the ward
    public static Polygon toPolygon(List<List<Double>> boundary) {
        if (boundary == null || boundary.size() < 3) {
            throw new BadRequestException("Boundary must have at least 3 points");
        }
        List<Coordinate> coordinates = new ArrayList<>();
        for (List<Double> pair : boundary) {
            if (pair == null || pair.size() != 2 || pair.get(0) == null || pair.get(1) == null) {
                throw new BadRequestException("Each boundary point must be [longitude, latitude]");
            }
            coordinates.add(new Coordinate(pair.get(0), pair.get(1)));
        }
        // A polygon must end where it starts, so close it if needed
        if (!coordinates.getFirst().equals2D(coordinates.getLast())) {
            coordinates.add(new Coordinate(coordinates.getFirst()));
        }
        Polygon polygon = FACTORY.createPolygon(coordinates.toArray(new Coordinate[0]));
        if (!polygon.isValid()) {
            throw new BadRequestException("Boundary is not a valid shape (check that the lines do not cross)");
        }
        return polygon;
    }

    public static List<List<Double>> toCoordinateList(Polygon polygon) {
        if (polygon == null) {
            return null;
        }
        return Arrays.stream(polygon.getExteriorRing().getCoordinates())
                .map(c -> List.of(c.getX(), c.getY()))
                .toList();
    }
}