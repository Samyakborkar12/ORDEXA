package com.ordexa.service;

import jakarta.persistence.*;

@Entity
@Table(name = "service_items")
public class ServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "average_service_time", nullable = false)
    private Integer averageServiceTime;

    @Column(nullable = false)
    private String status;

    public ServiceItem() {
    }

    public ServiceItem(
            Long organizationId,
            String name,
            String description,
            Integer averageServiceTime,
            String status) {

        this.organizationId = organizationId;
        this.name = name;
        this.description = description;
        this.averageServiceTime = averageServiceTime;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Integer getAverageServiceTime() {
        return averageServiceTime;
    }

    public String getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAverageServiceTime(Integer averageServiceTime) {
        this.averageServiceTime = averageServiceTime;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}