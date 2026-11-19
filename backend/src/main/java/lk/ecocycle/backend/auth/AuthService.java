package lk.ecocycle.backend.auth;

import lk.ecocycle.backend.auth.dto.AuthResponse;
import lk.ecocycle.backend.auth.dto.LoginRequest;
import lk.ecocycle.backend.auth.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);
}