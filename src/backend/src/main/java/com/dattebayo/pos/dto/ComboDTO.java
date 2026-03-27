package com.dattebayo.pos.dto;

import lombok.Data;
import java.util.List;

@Data
public class ComboDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Boolean available;
    private List<ComboItemDTO> items;
}
