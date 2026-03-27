package com.dattebayo.pos.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateComboDTO {
    private String name;
    private String description;
    private Double price;
    private Boolean available = true;
    private List<ComboItemDTO> items;
}
