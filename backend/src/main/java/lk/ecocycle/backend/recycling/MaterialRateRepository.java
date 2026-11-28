package lk.ecocycle.backend.recycling;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MaterialRateRepository extends JpaRepository<MaterialRate, Long> {

    @EntityGraph(attributePaths = "wasteType")
    List<MaterialRate> findAllBy();

    Optional<MaterialRate> findByWasteTypeId(Long wasteTypeId);
}