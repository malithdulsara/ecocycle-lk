package lk.ecocycle.backend.wastetype;

import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.wastetype.dto.WasteTypeResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/waste-types")
public class WasteTypeController {

    private final WasteTypeService wasteTypeService;

    public WasteTypeController(WasteTypeService wasteTypeService) {
        this.wasteTypeService = wasteTypeService;
    }

    // Public: organic, plastic, paper ...
    @GetMapping
    public ApiResponse<List<WasteTypeResponse>> getAll() {
        return ApiResponse.ok(wasteTypeService.getAll());
    }
}