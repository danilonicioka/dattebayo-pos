package com.dattebayo.pos.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private Integer quantity;
    private Double price;
    private String specialInstructions;
    private Double subtotal;
}
