package lk.ecocycle.backend.auth;

import lk.ecocycle.backend.auth.dto.AuthResponse;
import lk.ecocycle.backend.auth.dto.LoginRequest;
import lk.ecocycle.backend.auth.dto.RegisterRequest;
import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.UnauthorizedException;
import lk.ecocycle.backend.config.JwtProperties;
import lk.ecocycle.backend.user.Role;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import lk.ecocycle.backend.user.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthServiceImpl(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                           PasswordEncoder passwordEncoder, JwtService jwtService, JwtProperties jwtProperties) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    // Public sign-up is only for households. Other roles are created by an admin later.
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (request.phone() != null && userRepository.existsByPhone(request.phone())) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPhone(request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.HOUSEHOLD);
        if (request.preferredLanguage() != null) {
            user.setPreferredLanguage(request.preferredLanguage());
        }
        userRepository.save(user);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (!user.isEnabled()) {
            throw new UnauthorizedException("This account is disabled");
        }
        return issueTokens(user);
    }

    // Gives a new access token. The old refresh token is used up and a new one is returned.
    @Override
    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.isExpired()) {
            throw new UnauthorizedException("Refresh token is no longer valid. Please log in again");
        }
        User user = refreshToken.getUser();
        if (!user.isEnabled()) {
            throw new UnauthorizedException("This account is disabled");
        }

        refreshToken.setRevoked(true);
        return issueTokens(user);
    }

    @Override
    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(token -> token.setRevoked(true));
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(generateRandomToken());
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(Instant.now().plus(jwtProperties.refreshTokenDays(), ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                "Bearer",
                jwtService.accessTokenExpirySeconds(),
                UserResponse.from(user)
        );
    }

    private String generateRandomToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}