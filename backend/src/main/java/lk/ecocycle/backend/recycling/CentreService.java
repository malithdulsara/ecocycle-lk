package lk.ecocycle.backend.recycling;

import lk.ecocycle.backend.recycling.dto.CentreRequest;
import lk.ecocycle.backend.recycling.dto.CentreResponse;

import java.util.List;

public interface CentreService {

    // Open centres only (households and centre operators)
    List<CentreResponse> getActive();

    // Every centre, also closed ones (recycler manager / admin)
    List<CentreResponse> getAll();

    CentreResponse create(CentreRequest request);

    CentreResponse update(Long centreId, CentreRequest request);
}