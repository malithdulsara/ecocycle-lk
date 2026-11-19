package lk.ecocycle.backend.config;

import lk.ecocycle.backend.user.Role;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Creates the first ADMIN account when the app starts, if it does not exist yet
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AdminProperties adminProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminProperties = adminProperties;
    }

    @Override
    public void run(String... args) {
        String email = adminProperties.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User admin = new User();
        admin.setFullName(adminProperties.fullName());
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(adminProperties.password()));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        log.info("Created default admin user: {}", email);
    }
}