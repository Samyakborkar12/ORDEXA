package com.ordexa.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QueueTokenRepository
        extends JpaRepository<QueueToken, Long> {


    // =========================================================
    // COUNTER QUEUE
    // =========================================================

    List<QueueToken>
    findByCounterIdOrderByTokenNumberAsc(
            Long counterId);


    List<QueueToken>
    findByCounterIdAndStatusOrderByTokenNumberAsc(
            Long counterId,
            String status);


    Optional<QueueToken>
    findFirstByCounterIdAndStatusOrderByTokenNumberAsc(
            Long counterId,
            String status);


    // =========================================================
    // NEXT TOKEN NUMBER - OLD COUNTER METHOD
    // =========================================================

    @Query("""
        SELECT COALESCE(MAX(q.tokenNumber), 0)
        FROM QueueToken q
        WHERE q.counterId = :counterId
    """)
    Long findMaxTokenNumber(
            @Param("counterId") Long counterId);


    // =========================================================
    // NEXT TOKEN NUMBER - ORGANIZATION + SERVICE
    // =========================================================

    @Query("""
        SELECT MAX(q.tokenNumber)
        FROM QueueToken q
        WHERE q.organizationId = :organizationId
        AND q.serviceId = :serviceId
    """)
    Long findMaxTokenNumberByOrganizationIdAndServiceId(
            @Param("organizationId") Long organizationId,
            @Param("serviceId") Long serviceId);


    // =========================================================
    // CUSTOMER ACTIVE QUEUE
    // =========================================================

    Optional<QueueToken>
    findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
            Long userId,
            List<String> statuses);


    // =========================================================
    // CUSTOMER HISTORY
    // =========================================================

    List<QueueToken>
    findByUserIdOrderByCreatedAtDesc(
            Long userId);


    // =========================================================
    // SERVICE QUEUE
    // =========================================================

    List<QueueToken>
    findByServiceIdAndStatusOrderByTokenNumberAsc(
            Long serviceId,
            String status);


    // =========================================================
    // WALK-IN QUEUE
    // =========================================================

    @Query("""
        SELECT q
        FROM QueueToken q
        WHERE q.organizationId = :organizationId
        AND q.userId IS NULL
        ORDER BY q.createdAt DESC
    """)
    List<QueueToken> findWalkInsByOrganizationId(
            @Param("organizationId") Long organizationId);


    // =========================================================
    // ORGANIZATION QUEUE & ANALYTICS
    // =========================================================

    List<QueueToken>
    findByOrganizationIdOrderByCreatedAtDesc(
            Long organizationId);

    List<QueueToken>
    findByOrganizationIdAndStatusOrderByTokenNumberAsc(
            Long organizationId,
            String status);

    long countByOrganizationId(Long organizationId);

    long countByOrganizationIdAndStatus(Long organizationId, String status);
}