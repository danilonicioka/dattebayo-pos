package com.dattebayo.pos.dto;

import lombok.Data;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Data
public class OrderItemRequestDTO {
    /** Set for normal menu items. Null when comboId is provided. */
    private Long menuItemId;

    /** Set when this item represents a combo. Takes priority over menuItemId. */
    private Long comboId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String specialInstructions;

    private List<OrderItemVariationRequestDTO> variations;
}
