package com.ordexa.staff;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffRepository
        extends JpaRepository<Staff, Long> {

    List<Staff> findByOrganizationId(Long organizationId);

    boolean existsByEmailAndOrganizationId(
            String email,
            Long organizationId
    );
}