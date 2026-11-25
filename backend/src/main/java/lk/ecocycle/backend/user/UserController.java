package lk.ecocycle.backend.user;

import jakarta.validation.Valid;
import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.user.dto.CreateUserRequest;
import lk.ecocycle.backend.user.dto.UpdateUserRequest;
import lk.ecocycle.backend.user.dto.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Any logged-in user: returns their own profile
    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.ok(userService.getById(Long.valueOf(jwt.getSubject())));
    }

    // ADMIN only: list all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> listUsers() {
        return ApiResponse.ok(userService.getAll());
    }

    // Council officer / admin: active drivers (to assign pickups)
    @GetMapping("/drivers")
    @PreAuthorize("hasAnyRole('ADMIN', 'COUNCIL_OFFICER')")
    public ApiResponse<List<UserResponse>> listDrivers() {
        return ApiResponse.ok(userService.getActiveDrivers());
    }

    // ADMIN only: create a staff account with any role
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.ok("User created", userService.create(request));
    }

    // ADMIN only: change role or enable/disable an account
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> update(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
                                            @RequestBody UpdateUserRequest request) {
        return ApiResponse.ok("User updated", userService.update(Long.valueOf(jwt.getSubject()), id, request));
    }
}