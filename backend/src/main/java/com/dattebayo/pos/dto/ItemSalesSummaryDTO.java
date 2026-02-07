package com.dattebayo.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemSalesSummaryDTO {
    private String menuItemName;
    private Long quantity;
    private Double total;
}
