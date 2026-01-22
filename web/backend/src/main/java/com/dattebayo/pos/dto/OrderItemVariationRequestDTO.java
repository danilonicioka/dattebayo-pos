package com.dattebayo.pos.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class OrderItemVariationRequestDTO {
    @NotNull(message = "Menu item variation ID is required")
    private Long menuItemVariationId;

    @NotNull(message = "Selected status is required")
    private Boolean selected;
}