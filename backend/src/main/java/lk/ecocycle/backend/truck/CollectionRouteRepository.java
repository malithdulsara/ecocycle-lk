package lk.ecocycle.backend.truck;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CollectionRouteRepository extends JpaRepository<CollectionRoute, Long> {

    @EntityGraph(attributePaths = {"truck", "driver", "ward", "ward.council"})
    Optional<CollectionRoute> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"truck", "driver", "ward", "ward.council"})
    List<CollectionRoute> findByRouteDateOrderByIdAsc(LocalDate routeDate);

    @EntityGraph(attributePaths = {"truck", "driver", "ward", "ward.council"})
    List<CollectionRoute> findByDriverIdAndRouteDateOrderByIdAsc(Long driverId, LocalDate routeDate);

    @EntityGraph(attributePaths = {"truck", "driver", "ward", "ward.council"})
    List<CollectionRoute> findByStatus(RouteStatus status);

    @EntityGraph(attributePaths = {"truck", "driver", "ward", "ward.council"})
    List<CollectionRoute> findByWardIdAndStatus(Long wardId, RouteStatus status);

    // The route a driver is driving right now (there can only be one)
    @EntityGraph(attributePaths = {"truck", "driver", "ward", "ward.council"})
    Optional<CollectionRoute> findFirstByDriverIdAndStatus(Long driverId, RouteStatus status);

    boolean existsByTruckIdAndStatus(Long truckId, RouteStatus status);

    boolean existsByTruckIdAndWardIdAndRouteDate(Long truckId, Long wardId, LocalDate routeDate);
}