package com.dattebayo.pos.repository;

import com.dattebayo.pos.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatusOrderByCreatedAtAsc(Order.OrderStatus status);
    List<Order> findByStatusInOrderByCreatedAtAsc(List<Order.OrderStatus> statuses);
    List<Order> findAllByOrderByCreatedAtDesc();
}
