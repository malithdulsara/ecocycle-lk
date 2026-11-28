package lk.ecocycle.backend.recycling;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.recycling.dto.CentreRequest;
import lk.ecocycle.backend.recycling.dto.CentreResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
@RequestMapping("/api/v1/centres")
public class CentreController {

    private static final String MANAGERS = "hasAnyRole('ADMIN', 'RECYCLER_MANAGER')";

    private final CentreService centreService;

    public CentreController(CentreService centreService) {
        this.centreService = centreService;
    }

    // Any logged-in user: open centres (where to bring recyclables)
    @GetMapping
    public ApiResponse<List<CentreResponse>> getActive() {
        return ApiResponse.ok(centreService.getActive());
    }

    // Recycler manager / admin: every centre, also closed ones
    @GetMapping("/all")
    @PreAuthorize(MANAGERS)
    public ApiResponse<List<CentreResponse>> getAll() {
        return ApiResponse.ok(centreService.getAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize(MANAGERS)
    public ApiResponse<CentreResponse> create(@Valid @RequestBody CentreRequest request) {
        return ApiResponse.ok("Centre added", centreService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize(MANAGERS)
    public ApiResponse<CentreResponse> update(@PathVariable Long id, @Valid @RequestBody CentreRequest request) {
        return ApiResponse.ok("Centre updated", centreService.update(id, request));
    }
}