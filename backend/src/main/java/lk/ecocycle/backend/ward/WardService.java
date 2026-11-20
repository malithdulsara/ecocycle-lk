package lk.ecocycle.backend.ward;

import lk.ecocycle.backend.ward.dto.WardRequest;
import lk.ecocycle.backend.ward.dto.WardResponse;

import java.util.List;

public interface WardService {

    WardResponse create(Long councilId, WardRequest request);

    WardResponse update(Long wardId, WardRequest request);

    WardResponse getById(Long wardId);

    List<WardResponse> getByCouncil(Long councilId);

    void delete(Long wardId);

    WardResponse locate(Double latitude, Double longitude);
}