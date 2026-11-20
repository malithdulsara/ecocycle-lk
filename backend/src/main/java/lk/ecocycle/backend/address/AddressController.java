package lk.ecocycle.backend.address;

import jakarta.validation.Valid;
import lk.ecocycle.backend.address.dto.AddressRequest;
import lk.ecocycle.backend.address.dto.AddressResponse;
import lk.ecocycle.backend.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Addresses of the logged-in user
@RestController
@RequestMapping("/api/v1/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AddressResponse> create(@AuthenticationPrincipal Jwt jwt,
                                               @Valid @RequestBody AddressRequest request) {
        return ApiResponse.ok("Address saved", addressService.create(userId(jwt), request));
    }

    @GetMapping
    public ApiResponse<List<AddressResponse>> getMyAddresses(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok(addressService.getMyAddresses(userId(jwt)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        addressService.delete(userId(jwt), id);
        return ApiResponse.ok("Address deleted", null);
    }

    private Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}