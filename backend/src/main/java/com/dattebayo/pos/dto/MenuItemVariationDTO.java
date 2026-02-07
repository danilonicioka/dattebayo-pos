package com.dattebayo.pos.dto;

import lombok.Data;

@Data
public class MenuItemVariationDTO {
    private Long id;
    private String name;
    private String type;
    private Double additionalPrice;
    private Integer stockQuantity;
}