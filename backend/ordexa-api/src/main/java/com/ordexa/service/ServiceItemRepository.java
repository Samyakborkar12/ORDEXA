package com.ordexa.service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceItemRepository
        extends JpaRepository<ServiceItem, Long> {

    List<ServiceItem>
    findByOrganizationId(
            Long organizationId);

    List<ServiceItem>
    findByOrganizationIdOrderByNameAsc(
            Long organizationId);

    List<ServiceItem>
    findByOrganizationIdAndStatusOrderByNameAsc(
            Long organizationId,
            String status);

    boolean existsByOrganizationIdAndNameIgnoreCase(
            Long organizationId,
            String name);
}