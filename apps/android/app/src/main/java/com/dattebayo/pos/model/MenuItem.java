package com.dattebayo.pos.model;

import java.util.List;

public class MenuItem {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String category;
    private Boolean available;
    private Boolean applyMarkup;
    private Double manualPrice;
    private Boolean manualPriceEnabled;
    private List<MenuItemVariation> variations;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public Boolean getApplyMarkup() { return applyMarkup; }
    public void setApplyMarkup(Boolean applyMarkup) { this.applyMarkup = applyMarkup; }
    public Double getManualPrice() { return manualPrice; }
    public void setManualPrice(Double manualPrice) { this.manualPrice = manualPrice; }
    public Boolean getManualPriceEnabled() { return manualPriceEnabled; }
    public void setManualPriceEnabled(Boolean manualPriceEnabled) { this.manualPriceEnabled = manualPriceEnabled; }
    public List<MenuItemVariation> getVariations() { return variations; }
    public void setVariations(List<MenuItemVariation> variations) { this.variations = variations; }
}
