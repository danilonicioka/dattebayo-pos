package com.dattebayo.pos.model;

import java.util.List;

public class CreateOrderRequest {
    private String tableNumber;
    private List<OrderItemRequest> items;
    private String notes;

    public CreateOrderRequest(String tableNumber, List<OrderItemRequest> items, String notes) {
        this.tableNumber = tableNumber;
        this.items = items;
        this.notes = notes;
    }

    public String getTableNumber() { return tableNumber; }
    public void setTableNumber(String tableNumber) { this.tableNumber = tableNumber; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
