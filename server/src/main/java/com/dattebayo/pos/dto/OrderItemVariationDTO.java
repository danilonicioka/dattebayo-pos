package com.dattebayo.pos.dto;

import lombok.Data;

@Data
public class OrderItemVariationDTO {
    private Long id;
    private String name;
    private String type;
    private Double additionalPrice;
    private Boolean selected;
    private Integer importance;
}