package com.dattebayo.pos.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;


@Data
public class ComboItemDTO {
    private Long menuItemId;
    private String menuItemName;
    private List<Long> allowedVariationIds = new ArrayList<>();
    private List<com.dattebayo.pos.dto.MenuItemVariationDTO> allowedVariations = new ArrayList<>();
    private Integer quantity;
}
