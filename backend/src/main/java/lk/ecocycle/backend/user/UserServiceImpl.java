package lk.ecocycle.backend.user;

import lk.ecocycle.backend.auth.RefreshTokenRepository;
import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.user.dto.CreateUserRequest;
import lk.ecocycle.backend.user.dto.UpdateUserRequest;
import lk.ecocycle.backend.user.dto.UserResponse;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserResponse.from(findUser(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        // Newest accounts first
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveDrivers() {
        return userRepository.findByRoleAndEnabledTrueOrderByFullNameAsc(Role.DRIVER).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getActiveOfficers() {
        return userRepository.findByRoleAndEnabledTrueOrderByFullNameAsc(Role.COUNCIL_OFFICER).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    public UserResponse create(CreateUserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (request.phone() != null && !request.phone().isBlank() && userRepository.existsByPhone(request.phone())) {
            throw new BadRequestException("An account with this phone number already exists");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPhone(request.phone() == null || request.phone().isBlank() ? null : request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        return UserResponse.from(userRepository.save(user));
    }

    @Override
    public UserResponse update(Long currentUserId, Long userId, UpdateUserRequest request) {
        User user = findUser(userId);

        // An admin must not lock themselves out
        if (userId.equals(currentUserId)) {
            if (Boolean.FALSE.equals(request.enabled())) {
                throw new BadRequestException("You cannot disable your own account");
            }
            if (request.role() != null && request.role() != Role.ADMIN) {
                throw new BadRequestException("You cannot change your own role");
            }
        }

        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
            if (!request.enabled()) {
                // Log the user out everywhere: their refresh tokens stop working
                refreshTokenRepository.revokeAllForUser(userId);
            }
        }
        return UserResponse.from(user);
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}