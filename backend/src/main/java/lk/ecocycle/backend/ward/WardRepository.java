package lk.ecocycle.backend.ward;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WardRepository extends JpaRepository<Ward, Long> {

    @EntityGraph(attributePaths = "council")
    List<Ward> findByCouncilIdOrderByName(Long councilId);

    boolean existsByCouncilIdAndWardCodeIgnoreCase(Long councilId, String wardCode);

    boolean existsByCouncilIdAndWardCodeIgnoreCaseAndIdNot(Long councilId, String wardCode, Long id);

    // PostGIS: find the ward whose boundary contains the given point
    @Query(value = """
            SELECT * FROM wards w
            WHERE w.boundary IS NOT NULL
              AND ST_Contains(w.boundary, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326))
            LIMIT 1
            """, nativeQuery = true)
    Optional<Ward> findWardContaining(@Param("latitude") double latitude, @Param("longitude") double longitude);
}