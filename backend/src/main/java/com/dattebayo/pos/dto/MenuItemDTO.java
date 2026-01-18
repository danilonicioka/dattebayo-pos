package com.dattebayo.pos.dto;

import lombok.Data;

import java.util.List;

@Data
public class MenuItemDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private Boolean available;
    private List<MenuItemVariationDTO> variations;
}