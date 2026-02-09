package com.dattebayo.pos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "menu_item_variations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemVariation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // "MULTIPLE" or "SINGLE"

    @Column(nullable = false)
    private Double additionalPrice = 0.0;

    @Column(name = "stock_quantity")
    private Integer stockQuantity; // null means unlimited

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;
}