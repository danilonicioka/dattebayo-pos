package com.dattebayo.pos.dto;

import java.util.List;

public class MenuBatchUpdateDTO {
    private List<MenuUpdateItem> items;

    public List<MenuUpdateItem> getItems() {
        return items;
    }

    public void setItems(List<MenuUpdateItem> items) {
        this.items = items;
    }

    public static class MenuUpdateItem {
        private Long id;
        private Boolean available;
        private Double manualPrice;
        private Boolean manualPriceEnabled;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Boolean getAvailable() {
            return available;
        }

        public void setAvailable(Boolean available) {
            this.available = available;
        }

        public Double getManualPrice() {
            return manualPrice;
        }

        public void setManualPrice(Double manualPrice) {
            this.manualPrice = manualPrice;
        }

        public Boolean getManualPriceEnabled() {
            return manualPriceEnabled;
        }

        public void setManualPriceEnabled(Boolean manualPriceEnabled) {
            this.manualPriceEnabled = manualPriceEnabled;
        }
    }
}
