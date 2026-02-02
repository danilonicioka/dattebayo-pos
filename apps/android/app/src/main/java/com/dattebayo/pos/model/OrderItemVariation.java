package com.dattebayo.pos.model;

public class OrderItemVariation {
    private Long id;
    private String name;
    private String type;
    private Double additionalPrice;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(Double additionalPrice) { this.additionalPrice = additionalPrice; }
}
