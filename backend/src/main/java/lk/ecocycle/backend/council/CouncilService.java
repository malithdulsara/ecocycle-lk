package lk.ecocycle.backend.council;

import lk.ecocycle.backend.council.dto.CouncilRequest;
import lk.ecocycle.backend.council.dto.CouncilResponse;

import java.util.List;

public interface CouncilService {

    CouncilResponse create(CouncilRequest request);

    CouncilResponse update(Long id, CouncilRequest request);

    CouncilResponse getById(Long id);

    List<CouncilResponse> getAll();

    void delete(Long id);
}