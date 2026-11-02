package com.ordexa.queue;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_tokens")
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "counter_id", nullable = false)
    private Long counterId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "service_id")
    private Long serviceId;

    // Internal numeric sequence
    @Column(name = "token_number", nullable = false)
    private Long tokenNumber;

    // Display token e.g. CIT-GEN-001
    @Column(name = "token_code", nullable = false, length = 50)
    private String tokenCode;

    @Column(nullable = false)
    private String status;

    @Column(name = "walk_in_name")
    private String walkInName;

    @Column(name = "walk_in_phone")
    private String walkInPhone;

    @Column(name = "walk_in_note", length = 500)
    private String walkInNote;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "added_time_minutes", nullable = false)
    private Integer addedTimeMinutes = 0;


    // =========================================================
    // EMPTY CONSTRUCTOR
    // =========================================================

    public QueueToken() {
    }


    // =========================================================
    // CUSTOMER QUEUE CONSTRUCTOR
    // =========================================================

    public QueueToken(
            Long organizationId,
            Long counterId,
            Long userId,
            Long serviceId,
            Long tokenNumber,
            String status) {

        this.organizationId = organizationId;
        this.counterId = counterId;
        this.userId = userId;
        this.serviceId = serviceId;
        this.tokenNumber = tokenNumber;
        this.status = status;

        this.createdAt = LocalDateTime.now();
        this.addedTimeMinutes = 0;
    }


    // =========================================================
    // BASIC WALK-IN CONSTRUCTOR
    // =========================================================

    public QueueToken(
            Long organizationId,
            Long counterId,
            Long tokenNumber,
            String status) {

        this.organizationId = organizationId;
        this.counterId = counterId;
        this.tokenNumber = tokenNumber;
        this.status = status;

        this.createdAt = LocalDateTime.now();
        this.addedTimeMinutes = 0;
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public Long getCounterId() {
        return counterId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public Long getTokenNumber() {
        return tokenNumber;
    }

    public String getTokenCode() {
        return tokenCode;
    }

    public String getStatus() {
        return status;
    }

    public String getWalkInName() {
        return walkInName;
    }

    public String getWalkInPhone() {
        return walkInPhone;
    }

    public String getWalkInNote() {
        return walkInNote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getCalledAt() {
        return calledAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public Integer getAddedTimeMinutes() {
        return addedTimeMinutes;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public void setCounterId(Long counterId) {
        this.counterId = counterId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public void setTokenNumber(Long tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public void setTokenCode(String tokenCode) {
        this.tokenCode = tokenCode;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setWalkInName(String walkInName) {
        this.walkInName = walkInName;
    }

    public void setWalkInPhone(String walkInPhone) {
        this.walkInPhone = walkInPhone;
    }

    public void setWalkInNote(String walkInNote) {
        this.walkInNote = walkInNote;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setCalledAt(LocalDateTime calledAt) {
        this.calledAt = calledAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public void setAddedTimeMinutes(Integer addedTimeMinutes) {
        this.addedTimeMinutes = addedTimeMinutes;
    }
}