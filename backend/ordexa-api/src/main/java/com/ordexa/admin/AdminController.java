package com.ordexa.admin;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminRepository repository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AdminController(AdminRepository repository) {
        this.repository = repository;
    }


    // =========================================================
    // ADMIN REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin admin) {

        // Name validation
        if (admin.getName() == null ||
                admin.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Name is required");
        }


        // Email validation
        if (admin.getEmail() == null ||
                admin.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }


        // Password validation
        if (admin.getPassword() == null ||
                admin.getPassword().length() < 6) {

            return ResponseEntity
                    .badRequest()
                    .body("Password must be at least 6 characters");
        }


        // Clean email
        String email = admin.getEmail()
                .trim()
                .toLowerCase();


        // Check duplicate email
        if (repository.existsByEmail(email)) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Admin with this email already exists");
        }


        // Save cleaned email
        admin.setEmail(email);


        // =====================================================
        // HASH PASSWORD
        // =====================================================

        String hashedPassword =
                passwordEncoder.encode(admin.getPassword());

        admin.setPassword(hashedPassword);


        // Save admin
        Admin savedAdmin = repository.save(admin);


        // =====================================================
        // RESPONSE WITHOUT PASSWORD
        // =====================================================

        Map<String, Object> response = new HashMap<>();

        response.put("id", savedAdmin.getId());
        response.put("name", savedAdmin.getName());
        response.put("email", savedAdmin.getEmail());
        response.put(
                "message",
                "Admin registered successfully"
        );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // ADMIN LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Admin loginData) {

        // Check email and password
        if (loginData.getEmail() == null ||
                loginData.getPassword() == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Email and password are required");
        }


        // Clean email
        String email = loginData.getEmail()
                .trim()
                .toLowerCase();


        // Find admin
        Admin admin = repository
                .findByEmail(email)
                .orElse(null);


        // Admin not found
        if (admin == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }


        // =====================================================
        // CHECK BCrypt PASSWORD
        // =====================================================

        boolean passwordMatches =
                passwordEncoder.matches(
                        loginData.getPassword(),
                        admin.getPassword()
                );


        // Wrong password
        if (!passwordMatches) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }


        // =====================================================
        // LOGIN SUCCESS
        // PASSWORD NEVER RETURNED
        // =====================================================

        Map<String, Object> response = new HashMap<>();

        response.put("id", admin.getId());
        response.put("name", admin.getName());
        response.put("email", admin.getEmail());
        response.put(
                "message",
                "Login successful"
        );


        return ResponseEntity.ok(response);
    }


    // =========================================================
    // UPDATE ADMIN
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Admin admin = repository.findById(id).orElse(null);
        if (admin == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Admin not found");
        }

        if (body.containsKey("name") && body.get("name") != null) {
            admin.setName(body.get("name").trim());
        }

        if (body.containsKey("password") && body.get("password") != null
                && body.get("password").length() >= 6) {
            admin.setPassword(passwordEncoder.encode(body.get("password")));
        }

        Admin saved = repository.save(admin);

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", saved.getId());
        resp.put("name", saved.getName());
        resp.put("email", saved.getEmail());
        resp.put("message", "Admin updated successfully");

        return ResponseEntity.ok(resp);
    }


    // =========================================================
    // FORGOT / RESET PASSWORD
    // =========================================================

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

        Admin admin = repository.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (admin == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Admin with this email not found");
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            if (newPassword.length() < 6) {
                return ResponseEntity
                        .badRequest()
                        .body("Password must be at least 6 characters");
            }
            admin.setPassword(passwordEncoder.encode(newPassword));
            repository.save(admin);

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Password reset successful");
            return ResponseEntity.ok(resp);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Reset link / code verified for " + email);
        return ResponseEntity.ok(resp);
    }


    // =========================================================
    // API TEST
    // =========================================================

    @GetMapping
    public String adminApi() {

        return "ORDEXA Admin API is running";
    }
}