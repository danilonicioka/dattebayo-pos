package com.dattebayo.pos.dto;

import java.util.List;

public class StockBatchUpdateDTO {
    private List<StockUpdateItem> items;
    private List<StockUpdateItem> variations;

    public List<StockUpdateItem> getItems() {
        return items;
    }

    public void setItems(List<StockUpdateItem> items) {
        this.items = items;
    }

    public List<StockUpdateItem> getVariations() {
        return variations;
    }

    public void setVariations(List<StockUpdateItem> variations) {
        this.variations = variations;
    }

    public static class StockUpdateItem {
        private Long id;
        private Integer stockQuantity;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Integer getStockQuantity() {
            return stockQuantity;
        }

        public void setStockQuantity(Integer stockQuantity) {
            this.stockQuantity = stockQuantity;
        }
    }
}
