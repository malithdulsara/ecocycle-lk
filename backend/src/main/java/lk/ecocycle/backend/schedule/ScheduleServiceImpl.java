package lk.ecocycle.backend.schedule;

import lk.ecocycle.backend.address.Address;
import lk.ecocycle.backend.address.AddressRepository;
import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.council.Council;
import lk.ecocycle.backend.council.CouncilRepository;
import lk.ecocycle.backend.schedule.dto.ScheduleChangeRequest;
import lk.ecocycle.backend.schedule.dto.ScheduleChangeResponse;
import lk.ecocycle.backend.schedule.dto.ScheduleRequest;
import lk.ecocycle.backend.schedule.dto.ScheduleResponse;
import lk.ecocycle.backend.schedule.dto.UpcomingCollection;
import lk.ecocycle.backend.schedule.dto.WardCollectionsResponse;
import lk.ecocycle.backend.wastetype.WasteType;
import lk.ecocycle.backend.wastetype.WasteTypeRepository;
import lk.ecocycle.backend.wastetype.dto.WasteTypeResponse;
import lk.ecocycle.backend.ward.Ward;
import lk.ecocycle.backend.ward.WardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ScheduleServiceImpl implements ScheduleService {

    private static final ZoneId SRI_LANKA = ZoneId.of("Asia/Colombo");
    private static final int MAX_DAYS = 60;
    // A collection can be moved forward by a holiday, so we also look back this many days
    private static final int LOOK_BACK_DAYS = 14;

    private final CollectionScheduleRepository scheduleRepository;
    private final ScheduleChangeRepository changeRepository;
    private final WardRepository wardRepository;
    private final CouncilRepository councilRepository;
    private final WasteTypeRepository wasteTypeRepository;
    private final AddressRepository addressRepository;

    public ScheduleServiceImpl(CollectionScheduleRepository scheduleRepository,
                               ScheduleChangeRepository changeRepository,
                               WardRepository wardRepository,
                               CouncilRepository councilRepository,
                               WasteTypeRepository wasteTypeRepository,
                               AddressRepository addressRepository) {
        this.scheduleRepository = scheduleRepository;
        this.changeRepository = changeRepository;
        this.wardRepository = wardRepository;
        this.councilRepository = councilRepository;
        this.wasteTypeRepository = wasteTypeRepository;
        this.addressRepository = addressRepository;
    }

    // ---------- Weekly schedules ----------

    @Override
    public List<ScheduleResponse> getWardSchedules(Long wardId) {
        findWard(wardId);
        return scheduleRepository.findByWardId(wardId).stream()
                .sorted(Comparator.comparing(CollectionSchedule::getDayOfWeek)
                        .thenComparing(CollectionSchedule::getStartTime))
                .map(ScheduleResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ScheduleResponse create(Long wardId, ScheduleRequest request) {
        Ward ward = findWard(wardId);
        validateTimes(request);
        if (scheduleRepository.existsByWardIdAndWasteTypeIdAndDayOfWeek(
                wardId, request.wasteTypeId(), request.dayOfWeek())) {
            throw new BadRequestException("This waste type is already collected on that day in this ward");
        }

        CollectionSchedule schedule = new CollectionSchedule();
        schedule.setWard(ward);
        apply(schedule, request);
        return ScheduleResponse.from(scheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    public ScheduleResponse update(Long scheduleId, ScheduleRequest request) {
        CollectionSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
        validateTimes(request);
        if (scheduleRepository.existsByWardIdAndWasteTypeIdAndDayOfWeekAndIdNot(
                schedule.getWard().getId(), request.wasteTypeId(), request.dayOfWeek(), scheduleId)) {
            throw new BadRequestException("This waste type is already collected on that day in this ward");
        }

        apply(schedule, request);
        return ScheduleResponse.from(schedule);
    }

    @Override
    @Transactional
    public void delete(Long scheduleId) {
        if (!scheduleRepository.existsById(scheduleId)) {
            throw new ResourceNotFoundException("Schedule not found");
        }
        scheduleRepository.deleteById(scheduleId);
    }

    // ---------- Holiday changes ----------

    @Override
    public List<ScheduleChangeResponse> getUpcomingChanges(Long councilId) {
        findCouncil(councilId);
        return changeRepository
                .findByCouncilIdAndChangeDateGreaterThanEqualOrderByChangeDateAsc(councilId, today())
                .stream()
                .map(ScheduleChangeResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public ScheduleChangeResponse createChange(Long councilId, ScheduleChangeRequest request) {
        Council council = findCouncil(councilId);

        if (request.changeDate().isBefore(today())) {
            throw new BadRequestException("Date cannot be in the past");
        }
        if (request.changeType() == ChangeType.RESCHEDULED) {
            if (request.newDate() == null) {
                throw new BadRequestException("New date is required when rescheduling");
            }
            if (request.newDate().equals(request.changeDate())) {
                throw new BadRequestException("New date must be different from the original date");
            }
            if (request.newDate().isBefore(today())) {
                throw new BadRequestException("New date cannot be in the past");
            }
        }
        if (changeRepository.existsByCouncilIdAndChangeDate(councilId, request.changeDate())) {
            throw new BadRequestException("A change already exists for that date");
        }

        ScheduleChange change = new ScheduleChange();
        change.setCouncil(council);
        change.setChangeDate(request.changeDate());
        change.setChangeType(request.changeType());
        change.setNewDate(request.changeType() == ChangeType.RESCHEDULED ? request.newDate() : null);
        change.setReason(request.reason().trim());
        return ScheduleChangeResponse.from(changeRepository.save(change));
    }

    @Override
    @Transactional
    public void deleteChange(Long changeId) {
        if (!changeRepository.existsById(changeId)) {
            throw new ResourceNotFoundException("Schedule change not found");
        }
        changeRepository.deleteById(changeId);
    }

    // ---------- Upcoming collections ----------

    @Override
    public WardCollectionsResponse getUpcomingCollections(Long wardId, int days) {
        return buildUpcoming(findWard(wardId), days);
    }

    @Override
    public WardCollectionsResponse getMyUpcomingCollections(Long userId, int days) {
        List<Address> addresses = addressRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (addresses.isEmpty()) {
            throw new BadRequestException("Add your home address first to see your collection schedule");
        }
        Address home = addresses.stream()
                .filter(Address::isDefaultAddress)
                .findFirst()
                .orElse(addresses.getFirst());
        if (home.getWard() == null) {
            throw new BadRequestException("Your address is outside all council wards we serve");
        }
        return buildUpcoming(home.getWard(), days);
    }

    private WardCollectionsResponse buildUpcoming(Ward ward, int days) {
        if (days < 1 || days > MAX_DAYS) {
            throw new BadRequestException("Days must be between 1 and " + MAX_DAYS);
        }
        LocalDate today = today();
        LocalDate end = today.plusDays(days); // exclusive
        LocalDate from = today.minusDays(LOOK_BACK_DAYS);

        List<CollectionSchedule> schedules = scheduleRepository.findByWardId(ward.getId());
        Map<LocalDate, ScheduleChange> changes = changeRepository
                .findByCouncilIdAndChangeDateBetween(ward.getCouncil().getId(), from, end)
                .stream()
                .collect(Collectors.toMap(ScheduleChange::getChangeDate, Function.identity()));

        List<UpcomingCollection> result = new ArrayList<>();
        for (LocalDate date = from; date.isBefore(end); date = date.plusDays(1)) {
            for (CollectionSchedule schedule : schedules) {
                if (schedule.getDayOfWeek() == date.getDayOfWeek()) {
                    UpcomingCollection item = toCollection(schedule, date, changes.get(date));
                    boolean inRange = !item.date().isBefore(today) && item.date().isBefore(end);
                    if (inRange) {
                        result.add(item);
                    }
                }
            }
        }

        result.sort(Comparator.comparing(UpcomingCollection::date)
                .thenComparing(UpcomingCollection::startTime));
        return new WardCollectionsResponse(ward.getId(), ward.getName(), ward.getCouncil().getName(), result);
    }

    private UpcomingCollection toCollection(CollectionSchedule schedule, LocalDate date, ScheduleChange change) {
        WasteTypeResponse wasteType = WasteTypeResponse.from(schedule.getWasteType());
        if (change == null) {
            return new UpcomingCollection(date, null, wasteType, schedule.getStartTime(),
                    schedule.getEndTime(), CollectionStatus.SCHEDULED, schedule.getNotes());
        }
        if (change.getChangeType() == ChangeType.CANCELLED) {
            return new UpcomingCollection(date, null, wasteType, schedule.getStartTime(),
                    schedule.getEndTime(), CollectionStatus.CANCELLED, change.getReason());
        }
        return new UpcomingCollection(change.getNewDate(), date, wasteType, schedule.getStartTime(),
                schedule.getEndTime(), CollectionStatus.RESCHEDULED, change.getReason());
    }

    // ---------- Helpers ----------

    private void apply(CollectionSchedule schedule, ScheduleRequest request) {
        WasteType wasteType = wasteTypeRepository.findById(request.wasteTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Waste type not found"));
        schedule.setWasteType(wasteType);
        schedule.setDayOfWeek(request.dayOfWeek());
        schedule.setStartTime(request.startTime());
        schedule.setEndTime(request.endTime());
        schedule.setNotes(request.notes() == null || request.notes().isBlank() ? null : request.notes().trim());
    }

    private void validateTimes(ScheduleRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new BadRequestException("Start time must be before end time");
        }
    }

    private Ward findWard(Long wardId) {
        return wardRepository.findById(wardId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found"));
    }

    private Council findCouncil(Long councilId) {
        return councilRepository.findById(councilId)
                .orElseThrow(() -> new ResourceNotFoundException("Council not found"));
    }

    private LocalDate today() {
        return LocalDate.now(SRI_LANKA);
    }
}