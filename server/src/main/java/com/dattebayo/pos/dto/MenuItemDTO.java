package com.dattebayo.pos.dto;

import lombok.Data;

import java.util.List;

@Data
public class MenuItemDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Double basePrice;
    private String category;
    private Boolean available;
    private Boolean applyMarkup;
    private Double manualPrice;
    private Boolean manualPriceEnabled;
    private List<MenuItemVariationDTO> variations;
}