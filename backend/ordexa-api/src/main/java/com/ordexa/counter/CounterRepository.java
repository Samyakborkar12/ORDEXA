package com.ordexa.counter;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CounterRepository
        extends JpaRepository<Counter, Long> {

    List<Counter> findByOrganizationId(Long organizationId);

    List<Counter> findByOrganizationIdAndStatus(
            Long organizationId,
            String status);
}