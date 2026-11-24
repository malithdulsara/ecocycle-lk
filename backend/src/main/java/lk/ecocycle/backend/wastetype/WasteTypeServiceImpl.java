package lk.ecocycle.backend.wastetype;

import lk.ecocycle.backend.wastetype.dto.WasteTypeResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class WasteTypeServiceImpl implements WasteTypeService {

    private final WasteTypeRepository wasteTypeRepository;

    public WasteTypeServiceImpl(WasteTypeRepository wasteTypeRepository) {
        this.wasteTypeRepository = wasteTypeRepository;
    }

    @Override
    public List<WasteTypeResponse> getAll() {
        return wasteTypeRepository.findAllByOrderBySortOrderAsc().stream()
                .map(WasteTypeResponse::from)
                .toList();
    }
}