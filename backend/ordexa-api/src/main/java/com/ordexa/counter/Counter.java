package com.ordexa.counter;

import jakarta.persistence.*;

@Entity
@Table(name = "counters")
public class Counter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(nullable = false)
    private String name;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(nullable = false)
    private String status;

    public Counter() {
    }

    public Counter(Long organizationId, String name,
                   Long staffId, String status) {
        this.organizationId = organizationId;
        this.name = name;
        this.staffId = staffId;
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

    public Long getStaffId() {
        return staffId;
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

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}