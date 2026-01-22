package com.dattebayo.pos.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderItemDTO {
    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private Integer quantity;
    private Double price;
    private String specialInstructions;
    private Double subtotal;
    private List<OrderItemVariationDTO> variations;
}
