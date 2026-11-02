package com.ordexa.service;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceItemCounterRepository
        extends JpaRepository<ServiceItemCounter, Long> {

    List<ServiceItemCounter> findByServiceItemId(
            Long serviceItemId
    );

    List<ServiceItemCounter> findByCounterId(
            Long counterId
    );

    void deleteByServiceItemId(
            Long serviceItemId
    );

    void deleteByCounterId(
            Long counterId
    );

    boolean existsByServiceItemIdAndCounterId(
            Long serviceItemId,
            Long counterId
    );
}