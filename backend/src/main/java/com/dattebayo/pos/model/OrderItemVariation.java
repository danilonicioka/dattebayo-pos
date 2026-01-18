package com.dattebayo.pos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "order_item_variations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemVariation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_variation_id", nullable = false)
    private MenuItemVariation menuItemVariation;

    @Column(nullable = false)
    private Boolean selected = true; // For single type variations, this indicates if it's selected
}