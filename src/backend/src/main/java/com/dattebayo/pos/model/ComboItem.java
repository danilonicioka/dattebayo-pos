package com.dattebayo.pos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "combo_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComboItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_id", nullable = false)
    private Combo combo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @ManyToMany
    @JoinTable(
        name = "combo_item_allowed_variations",
        joinColumns = @JoinColumn(name = "combo_item_id"),
        inverseJoinColumns = @JoinColumn(name = "variation_id")
    )
    private List<MenuItemVariation> allowedVariations = new ArrayList<>();
    
    @Column(nullable = false)
    private Integer quantity = 1;
}
