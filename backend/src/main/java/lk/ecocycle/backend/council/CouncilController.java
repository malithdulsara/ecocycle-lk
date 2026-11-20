package lk.ecocycle.backend.council;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.council.dto.CouncilRequest;
import lk.ecocycle.backend.council.dto.CouncilResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/councils")
public class CouncilController {

    private final CouncilService councilService;

    public CouncilController(CouncilService councilService) {
        this.councilService = councilService;
    }

    // Public: anyone can see the list of councils
    @GetMapping
    public ApiResponse<List<CouncilResponse>> getAll() {
        return ApiResponse.ok(councilService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<CouncilResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(councilService.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CouncilResponse> create(@Valid @RequestBody CouncilRequest request) {
        return ApiResponse.ok("Council created", councilService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CouncilResponse> update(@PathVariable Long id, @Valid @RequestBody CouncilRequest request) {
        return ApiResponse.ok("Council updated", councilService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        councilService.delete(id);
        return ApiResponse.ok("Council deleted", null);
    }
}