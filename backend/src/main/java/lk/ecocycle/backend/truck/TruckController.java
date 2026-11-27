package lk.ecocycle.backend.truck;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.truck.dto.TruckRequest;
import lk.ecocycle.backend.truck.dto.TruckResponse;
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
@RequestMapping("/api/v1/trucks")
public class TruckController {

    private final TruckService truckService;

    public TruckController(TruckService truckService) {
        this.truckService = truckService;
    }

    // Council officer / admin: all trucks (to plan routes)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_OFFICER')")
    public ApiResponse<List<TruckResponse>> getAll() {
        return ApiResponse.ok(truckService.getAll());
    }

    // ADMIN only: add a truck
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TruckResponse> create(@Valid @RequestBody TruckRequest request) {
        return ApiResponse.ok("Truck added", truckService.create(request));
    }

    // ADMIN only: edit a truck or take it out of use
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TruckResponse> update(@PathVariable Long id, @Valid @RequestBody TruckRequest request) {
        return ApiResponse.ok("Truck updated", truckService.update(id, request));
    }
}