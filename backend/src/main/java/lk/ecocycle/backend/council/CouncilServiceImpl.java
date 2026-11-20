package lk.ecocycle.backend.council;

import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.council.dto.CouncilRequest;
import lk.ecocycle.backend.council.dto.CouncilResponse;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CouncilServiceImpl implements CouncilService {

    private final CouncilRepository councilRepository;

    public CouncilServiceImpl(CouncilRepository councilRepository) {
        this.councilRepository = councilRepository;
    }

    @Override
    public CouncilResponse create(CouncilRequest request) {
        if (councilRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new BadRequestException("A council with this name already exists");
        }
        Council council = new Council();
        applyRequest(council, request);
        return CouncilResponse.from(councilRepository.save(council));
    }

    @Override
    public CouncilResponse update(Long id, CouncilRequest request) {
        Council council = findCouncil(id);
        if (councilRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
            throw new BadRequestException("A council with this name already exists");
        }
        applyRequest(council, request);
        return CouncilResponse.from(council);
    }

    @Override
    @Transactional(readOnly = true)
    public CouncilResponse getById(Long id) {
        return CouncilResponse.from(findCouncil(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouncilResponse> getAll() {
        return councilRepository.findAll(Sort.by("name")).stream()
                .map(CouncilResponse::from)
                .toList();
    }

    @Override
    public void delete(Long id) {
        councilRepository.delete(findCouncil(id));
    }

    private Council findCouncil(Long id) {
        return councilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Council not found"));
    }

    private void applyRequest(Council council, CouncilRequest request) {
        council.setName(request.name().trim());
        council.setDistrict(request.district().trim());
        council.setContactEmail(request.contactEmail());
        council.setContactPhone(request.contactPhone());
    }
}