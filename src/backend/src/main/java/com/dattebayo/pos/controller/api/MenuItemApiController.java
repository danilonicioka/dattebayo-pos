package com.dattebayo.pos.controller.api;

import com.dattebayo.pos.dto.MenuItemDTO;
import com.dattebayo.pos.dto.StockBatchUpdateDTO;
import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuItemApiController {
    
    @Autowired
    private MenuItemService menuItemService;
    
    @GetMapping
    public ResponseEntity<List<MenuItemDTO>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemService.getAllMenuItems());
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<MenuItemDTO>> getAvailableMenuItems() {
        return ResponseEntity.ok(menuItemService.getAvailableMenuItems());
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(menuItemService.getMenuItemsByCategory(category));
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(menuItemService.getAllCategories());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        Optional<MenuItem> menuItem = menuItemService.getMenuItemById(id);
        return menuItem.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(menuItemService.saveMenuItem(menuItem));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem menuItem) {
        menuItem.setId(id);
        return ResponseEntity.ok(menuItemService.saveMenuItem(menuItem));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/available")
    public ResponseEntity<MenuItem> toggleAvailability(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        Optional<MenuItem> menuItemOpt = menuItemService.getMenuItemById(id);
        if (menuItemOpt.isPresent()) {
            MenuItem menuItem = menuItemOpt.get();
            if (payload.containsKey("available")) {
                menuItem.setAvailable(payload.get("available"));
                return ResponseEntity.ok(menuItemService.saveMenuItem(menuItem));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/manual-price")
    public ResponseEntity<MenuItem> updateManualPrice(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<MenuItem> menuItemOpt = menuItemService.getMenuItemById(id);
        if (menuItemOpt.isPresent()) {
            MenuItem menuItem = menuItemOpt.get();
            if (payload.containsKey("manualPrice")) {
                menuItem.setManualPrice(Double.parseDouble(payload.get("manualPrice").toString()));
            }
            if (payload.containsKey("manualPriceEnabled")) {
                menuItem.setManualPriceEnabled(Boolean.parseBoolean(payload.get("manualPriceEnabled").toString()));
            }
            return ResponseEntity.ok(menuItemService.saveMenuItem(menuItem));
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<MenuItem> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        Optional<MenuItem> menuItemOpt = menuItemService.getMenuItemById(id);
        if (menuItemOpt.isPresent()) {
            MenuItem menuItem = menuItemOpt.get();
            if (payload.containsKey("stockQuantity")) {
                menuItem.setStockQuantity(payload.get("stockQuantity"));
                return ResponseEntity.ok(menuItemService.saveMenuItem(menuItem));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/variations/{id}/stock")
    public ResponseEntity<com.dattebayo.pos.model.MenuItemVariation> updateVariationStock(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        Optional<com.dattebayo.pos.model.MenuItemVariation> variationOpt = menuItemService.getVariationById(id);
        if (variationOpt.isPresent()) {
            com.dattebayo.pos.model.MenuItemVariation variation = variationOpt.get();
            if (payload.containsKey("stockQuantity")) {
                variation.setStockQuantity(payload.get("stockQuantity"));
                return ResponseEntity.ok(menuItemService.saveVariation(variation));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/batch-stock")
    public ResponseEntity<Void> batchUpdateStock(@RequestBody StockBatchUpdateDTO batchUpdate) {
        menuItemService.updateStockBatch(batchUpdate);
        return ResponseEntity.ok().build();
    }
}
