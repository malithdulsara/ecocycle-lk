package lk.ecocycle.backend.user;

import lk.ecocycle.backend.user.dto.CreateUserRequest;
import lk.ecocycle.backend.user.dto.UpdateUserRequest;
import lk.ecocycle.backend.user.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse getById(Long id);

    List<UserResponse> getAll();

    // Active drivers, for the "assign driver" dropdown
    List<UserResponse> getActiveDrivers();

    // Active council officers, for the "assign officer" dropdown
    List<UserResponse> getActiveOfficers();

    UserResponse create(CreateUserRequest request);

    UserResponse update(Long currentUserId, Long userId, UpdateUserRequest request);
}