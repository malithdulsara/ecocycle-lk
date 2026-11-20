package lk.ecocycle.backend.ward;

import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.common.geo.GeoUtils;
import lk.ecocycle.backend.council.Council;
import lk.ecocycle.backend.council.CouncilRepository;
import lk.ecocycle.backend.ward.dto.WardRequest;
import lk.ecocycle.backend.ward.dto.WardResponse;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class WardServiceImpl implements WardService {

    private final WardRepository wardRepository;
    private final CouncilRepository councilRepository;

    public WardServiceImpl(WardRepository wardRepository, CouncilRepository councilRepository) {
        this.wardRepository = wardRepository;
        this.councilRepository = councilRepository;
    }

    @Override
    public WardResponse create(Long councilId, WardRequest request) {
        Council council = councilRepository.findById(councilId)
                .orElseThrow(() -> new ResourceNotFoundException("Council not found"));
        if (wardRepository.existsByCouncilIdAndWardCodeIgnoreCase(councilId, request.wardCode().trim())) {
            throw new BadRequestException("This council already has a ward with this code");
        }
        Ward ward = new Ward();
        ward.setCouncil(council);
        applyRequest(ward, request);
        return WardResponse.from(wardRepository.save(ward));
    }

    @Override
    public WardResponse update(Long wardId, WardRequest request) {
        Ward ward = findWard(wardId);
        Long councilId = ward.getCouncil().getId();
        if (wardRepository.existsByCouncilIdAndWardCodeIgnoreCaseAndIdNot(councilId, request.wardCode().trim(), wardId)) {
            throw new BadRequestException("This council already has a ward with this code");
        }
        applyRequest(ward, request);
        return WardResponse.from(ward);
    }

    @Override
    @Transactional(readOnly = true)
    public WardResponse getById(Long wardId) {
        return WardResponse.from(findWard(wardId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WardResponse> getByCouncil(Long councilId) {
        if (!councilRepository.existsById(councilId)) {
            throw new ResourceNotFoundException("Council not found");
        }
        return wardRepository.findByCouncilIdOrderByName(councilId).stream()
                .map(WardResponse::from)
                .toList();
    }

    @Override
    public void delete(Long wardId) {
        wardRepository.delete(findWard(wardId));
    }

    @Override
    @Transactional(readOnly = true)
    public WardResponse locate(Double latitude, Double longitude) {
        Point point = GeoUtils.toPoint(latitude, longitude); // also checks the values
        return wardRepository.findWardContaining(point.getY(), point.getX())
                .map(WardResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("No ward found for this location"));
    }

    private Ward findWard(Long wardId) {
        return wardRepository.findById(wardId)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found"));
    }

    private void applyRequest(Ward ward, WardRequest request) {
        ward.setName(request.name().trim());
        ward.setWardCode(request.wardCode().trim().toUpperCase());
        ward.setBoundary(request.boundary() == null ? null : GeoUtils.toPolygon(request.boundary()));
    }
}