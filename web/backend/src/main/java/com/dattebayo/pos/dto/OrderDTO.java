package com.dattebayo.pos.dto;

import com.dattebayo.pos.model.Order;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String tableNumber;
    private Order.OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String notes;
    private List<OrderItemDTO> items = new ArrayList<>();
    private Double total;
}
