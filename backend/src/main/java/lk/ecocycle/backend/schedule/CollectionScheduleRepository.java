package lk.ecocycle.backend.schedule;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface CollectionScheduleRepository extends JpaRepository<CollectionSchedule, Long> {

    @EntityGraph(attributePaths = "wasteType")
    List<CollectionSchedule> findByWardId(Long wardId);

    boolean existsByWardIdAndWasteTypeIdAndDayOfWeek(Long wardId, Long wasteTypeId, DayOfWeek dayOfWeek);

    boolean existsByWardIdAndWasteTypeIdAndDayOfWeekAndIdNot(Long wardId, Long wasteTypeId, DayOfWeek dayOfWeek, Long id);
}