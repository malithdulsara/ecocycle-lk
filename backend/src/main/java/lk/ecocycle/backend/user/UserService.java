package lk.ecocycle.backend.user;

import lk.ecocycle.backend.user.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse getById(Long id);

    List<UserResponse> getAll();
}