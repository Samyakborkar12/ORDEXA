package com.ordexa.service;

import jakarta.persistence.*;

@Entity
@Table(
    name = "service_item_counters",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_service_item_counter",
        columnNames = {
            "service_item_id",
            "counter_id"
        }
    )
)
public class ServiceItemCounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "service_item_id",
        nullable = false
    )
    private Long serviceItemId;

    @Column(
        name = "counter_id",
        nullable = false
    )
    private Long counterId;

    // =========================================
    // CONSTRUCTORS
    // =========================================

    public ServiceItemCounter() {
    }

    public ServiceItemCounter(
            Long serviceItemId,
            Long counterId) {

        this.serviceItemId = serviceItemId;
        this.counterId = counterId;
    }

    // =========================================
    // GETTERS
    // =========================================

    public Long getId() {
        return id;
    }

    public Long getServiceItemId() {
        return serviceItemId;
    }

    public Long getCounterId() {
        return counterId;
    }

    // =========================================
    // SETTERS
    // =========================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setServiceItemId(Long serviceItemId) {
        this.serviceItemId = serviceItemId;
    }

    public void setCounterId(Long counterId) {
        this.counterId = counterId;
    }
}