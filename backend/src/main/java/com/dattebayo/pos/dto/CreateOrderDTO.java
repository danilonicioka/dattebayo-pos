package com.dattebayo.pos.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class CreateOrderDTO {
    @NotBlank(message = "Table number is required")
    private String tableNumber;
    
    @NotEmpty(message = "Order must have at least one item")
    private List<OrderItemRequestDTO> items;
    
    private String notes;
}
