package lk.ecocycle.backend.wastetype;

import lk.ecocycle.backend.wastetype.dto.WasteTypeResponse;

import java.util.List;

public interface WasteTypeService {

    List<WasteTypeResponse> getAll();
}