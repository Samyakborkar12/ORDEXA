package com.ordexa.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository repository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public UserController(UserRepository repository) {
        this.repository = repository;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {

        if (user.getName() == null ||
                user.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Name is required");
        }

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }

        if (user.getPassword() == null ||
                user.getPassword().length() < 6) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Password must be at least 6 characters"
                    );
        }

        String email =
                user.getEmail()
                        .trim()
                        .toLowerCase();

        if (repository.existsByEmail(email)) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                        "An account with this email already exists"
                    );
        }

        user.setName(
                user.getName().trim()
        );

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        if (user.getPhone() != null) {

            user.setPhone(
                    user.getPhone().trim()
            );
        }

        user.setStatus("ACTIVE");

        User saved =
                repository.save(user);

        Map<String, Object> response =
                new HashMap<>();

        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());
        response.put("message",
                "Registration successful");

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginData) {

        if (loginData.getEmail() == null ||
                loginData.getPassword() == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Email and password are required"
                    );
        }

        String email =
                loginData.getEmail()
                        .trim()
                        .toLowerCase();

        User user =
                repository.findByEmail(email)
                        .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                        "Invalid email or password"
                    );
        }

        if (!passwordEncoder.matches(
                loginData.getPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                        "Invalid email or password"
                    );
        }

        if (!"ACTIVE".equalsIgnoreCase(
                user.getStatus())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                        "This account is inactive"
                    );
        }

        Map<String, Object> response =
                new HashMap<>();

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("message",
                "Login successful");

        return ResponseEntity.ok(response);
    }


    // =========================
    // GET USER
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(
            @PathVariable Long id) {

        User user =
                repository.findById(id)
                        .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        Map<String, Object> response =
                new HashMap<>();

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("status", user.getStatus());

        return ResponseEntity.ok(response);
    }


    // =========================
    // UPDATE PROFILE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, String> updateData) {

        User user = repository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        if (updateData.containsKey("name") && updateData.get("name") != null) {
            user.setName(updateData.get("name").trim());
        }

        if (updateData.containsKey("phone") && updateData.get("phone") != null) {
            user.setPhone(updateData.get("phone").trim());
        }

        if (updateData.containsKey("password") && updateData.get("password") != null
                && updateData.get("password").length() >= 6) {
            user.setPassword(passwordEncoder.encode(updateData.get("password")));
        }

        User saved = repository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("name", saved.getName());
        response.put("email", saved.getEmail());
        response.put("phone", saved.getPhone());
        response.put("message", "Profile updated successfully");

        return ResponseEntity.ok(response);
    }


    // =========================
    // FORGOT / RESET PASSWORD
    // =========================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        String newPassword = body.get("newPassword");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }

        User user = repository.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User with this email not found");
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            if (newPassword.length() < 6) {
                return ResponseEntity
                        .badRequest()
                        .body("Password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            repository.save(user);

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Password reset successful");
            return ResponseEntity.ok(resp);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Reset link / code verified for " + email);
        return ResponseEntity.ok(resp);
    }
}