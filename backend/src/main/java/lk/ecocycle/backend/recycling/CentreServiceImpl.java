package lk.ecocycle.backend.recycling;

import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.common.geo.GeoUtils;
import lk.ecocycle.backend.recycling.dto.CentreRequest;
import lk.ecocycle.backend.recycling.dto.CentreResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CentreServiceImpl implements CentreService {

    private final CollectionCentreRepository centreRepository;

    public CentreServiceImpl(CollectionCentreRepository centreRepository) {
        this.centreRepository = centreRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CentreResponse> getActive() {
        return centreRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(CentreResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CentreResponse> getAll() {
        return centreRepository.findAllByOrderByNameAsc().stream()
                .map(CentreResponse::from)
                .toList();
    }

    @Override
    public CentreResponse create(CentreRequest request) {
        String name = request.name().trim();
        if (centreRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("A centre with this name already exists");
        }
        CollectionCentre centre = new CollectionCentre();
        apply(centre, name, request);
        return CentreResponse.from(centreRepository.save(centre));
    }

    @Override
    public CentreResponse update(Long centreId, CentreRequest request) {
        CollectionCentre centre = centreRepository.findById(centreId)
                .orElseThrow(() -> new ResourceNotFoundException("Centre not found"));
        String name = request.name().trim();
        if (centreRepository.existsByNameIgnoreCaseAndIdNot(name, centreId)) {
            throw new BadRequestException("A centre with this name already exists");
        }
        apply(centre, name, request);
        return CentreResponse.from(centre);
    }

    private void apply(CollectionCentre centre, String name, CentreRequest request) {
        centre.setName(name);
        centre.setAddress(request.address().trim());
        centre.setPhone(blankToNull(request.phone()));
        centre.setOpeningHours(blankToNull(request.openingHours()));
        centre.setLocation(GeoUtils.toPoint(request.latitude(), request.longitude()));
        if (request.active() != null) {
            centre.setActive(request.active());
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}