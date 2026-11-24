package lk.ecocycle.backend.schedule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleChangeRepository extends JpaRepository<ScheduleChange, Long> {

    List<ScheduleChange> findByCouncilIdAndChangeDateGreaterThanEqualOrderByChangeDateAsc(Long councilId, LocalDate from);

    List<ScheduleChange> findByCouncilIdAndChangeDateBetween(Long councilId, LocalDate from, LocalDate to);

    boolean existsByCouncilIdAndChangeDate(Long councilId, LocalDate changeDate);
}