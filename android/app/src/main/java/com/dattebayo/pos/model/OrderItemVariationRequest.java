package com.dattebayo.pos.model;

public class OrderItemVariationRequest {
    private Long menuItemVariationId;
    private Boolean selected;
    private Integer quantity;

    public OrderItemVariationRequest(Long menuItemVariationId, Boolean selected, Integer quantity) {
        this.menuItemVariationId = menuItemVariationId;
        this.selected = selected;
        this.quantity = quantity;
    }

    public Long getMenuItemVariationId() { return menuItemVariationId; }
    public void setMenuItemVariationId(Long menuItemVariationId) { this.menuItemVariationId = menuItemVariationId; }
    public Boolean getSelected() { return selected; }
    public void setSelected(Boolean selected) { this.selected = selected; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
