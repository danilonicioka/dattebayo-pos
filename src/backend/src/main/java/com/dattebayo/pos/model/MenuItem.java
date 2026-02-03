package com.dattebayo.pos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private Boolean available = true;

    private Double manualPrice;
    
    private Boolean manualPriceEnabled = false;

    @Column(nullable = false)
    private Boolean applyMarkup = true;

    private Integer stockQuantity; // null means unlimited/untracked

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MenuItemVariation> variations = new ArrayList<>();
}
