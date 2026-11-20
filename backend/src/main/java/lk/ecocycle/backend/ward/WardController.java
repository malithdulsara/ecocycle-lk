package lk.ecocycle.backend.ward;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.ward.dto.WardRequest;
import lk.ecocycle.backend.ward.dto.WardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class WardController {

    private final WardService wardService;

    public WardController(WardService wardService) {
        this.wardService = wardService;
    }

    // Public: wards of one council
    @GetMapping("/councils/{councilId}/wards")
    public ApiResponse<List<WardResponse>> getByCouncil(@PathVariable Long councilId) {
        return ApiResponse.ok(wardService.getByCouncil(councilId));
    }

    // Public: which ward is this location in?
    @GetMapping("/wards/locate")
    public ApiResponse<WardResponse> locate(@RequestParam Double latitude, @RequestParam Double longitude) {
        return ApiResponse.ok(wardService.locate(latitude, longitude));
    }

    @GetMapping("/wards/{id}")
    public ApiResponse<WardResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(wardService.getById(id));
    }

    @PostMapping("/councils/{councilId}/wards")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<WardResponse> create(@PathVariable Long councilId, @Valid @RequestBody WardRequest request) {
        return ApiResponse.ok("Ward created", wardService.create(councilId, request));
    }

    @PutMapping("/wards/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<WardResponse> update(@PathVariable Long id, @Valid @RequestBody WardRequest request) {
        return ApiResponse.ok("Ward updated", wardService.update(id, request));
    }

    @DeleteMapping("/wards/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        wardService.delete(id);
        return ApiResponse.ok("Ward deleted", null);
    }
}