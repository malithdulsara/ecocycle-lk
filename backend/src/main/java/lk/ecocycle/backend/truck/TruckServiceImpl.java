package lk.ecocycle.backend.truck;

import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.council.Council;
import lk.ecocycle.backend.council.CouncilRepository;
import lk.ecocycle.backend.truck.dto.TruckRequest;
import lk.ecocycle.backend.truck.dto.TruckResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@Transactional
public class TruckServiceImpl implements TruckService {

    // Sri Lankan number plates: "WP LB-1234", "LB-1234" or "254-1234"
    private static final Pattern PLATE = Pattern.compile("^([A-Z]{2} )?([A-Z]{1,3}|\\d{2,3})-\\d{4}$");

    private final TruckRepository truckRepository;
    private final CouncilRepository councilRepository;

    public TruckServiceImpl(TruckRepository truckRepository, CouncilRepository councilRepository) {
        this.truckRepository = truckRepository;
        this.councilRepository = councilRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TruckResponse> getAll() {
        return truckRepository.findAllByOrderByRegistrationNumberAsc().stream()
                .map(TruckResponse::from)
                .toList();
    }

    @Override
    public TruckResponse create(TruckRequest request) {
        String plate = normalisePlate(request.registrationNumber());
        if (truckRepository.existsByRegistrationNumber(plate)) {
            throw new BadRequestException("A truck with this registration number already exists");
        }
        Truck truck = new Truck();
        apply(truck, plate, request);
        return TruckResponse.from(truckRepository.save(truck));
    }

    @Override
    public TruckResponse update(Long truckId, TruckRequest request) {
        Truck truck = truckRepository.findById(truckId)
                .orElseThrow(() -> new ResourceNotFoundException("Truck not found"));
        String plate = normalisePlate(request.registrationNumber());
        if (truckRepository.existsByRegistrationNumberAndIdNot(plate, truckId)) {
            throw new BadRequestException("A truck with this registration number already exists");
        }
        apply(truck, plate, request);
        return TruckResponse.from(truck);
    }

    private void apply(Truck truck, String plate, TruckRequest request) {
        Council council = councilRepository.findById(request.councilId())
                .orElseThrow(() -> new ResourceNotFoundException("Council not found"));
        truck.setRegistrationNumber(plate);
        truck.setModel(request.model() == null || request.model().isBlank() ? null : request.model().trim());
        truck.setCapacityKg(request.capacityKg());
        truck.setCouncil(council);
        if (request.active() != null) {
            truck.setActive(request.active());
        }
    }

    // " wp  lb-1234 " -> "WP LB-1234"
    private String normalisePlate(String value) {
        String plate = value.trim().toUpperCase(Locale.ROOT).replaceAll("\\s+", " ");
        if (!PLATE.matcher(plate).matches()) {
            throw new BadRequestException("Registration number must look like WP LB-1234");
        }
        return plate;
    }
}