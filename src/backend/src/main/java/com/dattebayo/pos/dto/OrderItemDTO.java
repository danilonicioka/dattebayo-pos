package com.dattebayo.pos.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderItemDTO {
    private Long id;
    private Long menuItemId;
    private String menuItemName;
    /** Populated when this order item represents a combo. */
    private Long comboId;
    private String comboName;
    private Integer quantity;
    private Double price;
    private String specialInstructions;
    private Double subtotal;
    private List<OrderItemVariationDTO> variations;
    private List<String> comboItemDetails;
    private List<Long> excludedComboItemIds;
}
