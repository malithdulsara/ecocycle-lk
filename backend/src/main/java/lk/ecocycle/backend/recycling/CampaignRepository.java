package lk.ecocycle.backend.recycling;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    @EntityGraph(attributePaths = "wasteType")
    List<Campaign> findAllByOrderByStartDateDescIdDesc();

    @EntityGraph(attributePaths = "wasteType")
    Optional<Campaign> findWithWasteTypeById(Long id);

    // Campaigns running on this day: start <= day <= end
    @EntityGraph(attributePaths = "wasteType")
    List<Campaign> findByActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAsc(
            LocalDate start, LocalDate end);
}