package com.dattebayo.pos.model;

import java.util.List;

public class OrderItemRequest {
    private Long menuItemId;
    private Integer quantity;
    private String specialInstructions;
    private List<OrderItemVariationRequest> variations;

    public OrderItemRequest(Long menuItemId, Integer quantity, String specialInstructions, List<OrderItemVariationRequest> variations) {
        this.menuItemId = menuItemId;
        this.quantity = quantity;
        this.specialInstructions = specialInstructions;
        this.variations = variations;
    }

    public Long getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    public List<OrderItemVariationRequest> getVariations() { return variations; }
    public void setVariations(List<OrderItemVariationRequest> variations) { this.variations = variations; }
}
