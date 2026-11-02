package com.ordexa.notification;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(
            NotificationRepository notificationRepository) {

        this.notificationRepository =
                notificationRepository;
    }


    // =====================================================
    // GET ALL USER NOTIFICATIONS
    // =====================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getNotifications(
            @PathVariable Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdOrderByCreatedAtDesc(userId);

        return ResponseEntity.ok(notifications);
    }


    // =====================================================
    // GET UNREAD NOTIFICATIONS
    // =====================================================

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnreadNotifications(
            @PathVariable Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndReadFalseOrderByCreatedAtDesc(
                                userId);

        return ResponseEntity.ok(notifications);
    }


    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id) {

        Notification notification =
                notificationRepository
                        .findById(id)
                        .orElse(null);

        if (notification == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Notification not found");
        }

        notification.setRead(true);

        return ResponseEntity.ok(
                notificationRepository.save(notification)
        );
    }


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                userId);

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);

        return ResponseEntity.ok(
                "All notifications marked as read"
        );
    }


    // =====================================================
    // DELETE ONE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long id) {

        if (!notificationRepository.existsById(id)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Notification not found");
        }

        notificationRepository.deleteById(id);

        return ResponseEntity.ok(
                "Notification deleted"
        );
    }
}