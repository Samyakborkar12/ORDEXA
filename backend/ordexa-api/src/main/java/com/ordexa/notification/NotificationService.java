package com.ordexa.notification;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {

        this.notificationRepository = notificationRepository;
    }

    public void queueJoined(Long userId, Long tokenNumber) {

        if (userId == null) {
            return;
        }

        Notification notification = new Notification(
                userId,
                "Queue Joined",
                "You have successfully joined the queue. Your token number is "
                        + tokenNumber + ".",
                "QUEUE_JOINED"
        );

        notificationRepository.save(notification);
    }

    public void tokenServed(Long userId, Long tokenNumber) {

        if (userId == null) {
            return;
        }

        Notification notification = new Notification(
                userId,
                "Your Turn",
                "Token " + tokenNumber
                        + " is now being served. Please proceed to the counter.",
                "TOKEN_SERVED"
        );

        notificationRepository.save(notification);
    }

    public void tokenSkipped(Long userId, Long tokenNumber) {

        if (userId == null) {
            return;
        }

        Notification notification = new Notification(
                userId,
                "Queue Token Skipped",
                "Your token " + tokenNumber
                        + " has been skipped.",
                "TOKEN_SKIPPED"
        );

        notificationRepository.save(notification);
    }

    public void queueCompleted(Long userId, Long tokenNumber) {

        if (userId == null) {
            return;
        }

        Notification notification = new Notification(
                userId,
                "Queue Completed",
                "Your queue service for token "
                        + tokenNumber
                        + " has been completed.",
                "QUEUE_COMPLETED"
        );

        notificationRepository.save(notification);
    }

    public void timeAdded(
            Long userId,
            Long tokenNumber,
            Integer minutes) {

        if (userId == null) {
            return;
        }

        Notification notification = new Notification(
                userId,
                "Queue Time Updated",
                minutes
                        + " additional minutes have been added to token "
                        + tokenNumber
                        + ".",
                "QUEUE_UPDATE"
        );

        notificationRepository.save(notification);
    }
}