package com.dattebayo.pos.repository;

import com.dattebayo.pos.model.OrderItemVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemVariationRepository extends JpaRepository<OrderItemVariation, Long> {
    List<OrderItemVariation> findByOrderItemId(Long orderItemId);
}