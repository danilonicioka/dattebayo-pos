package com.dattebayo.pos.service;

import com.dattebayo.pos.dto.MenuItemDTO;
import com.dattebayo.pos.dto.MenuItemVariationDTO;
import com.dattebayo.pos.dto.MenuBatchUpdateDTO;
import com.dattebayo.pos.dto.StockBatchUpdateDTO;
import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MenuItemService {
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    @Autowired
    private ConfigurationService configurationService;

    @Autowired
    private com.dattebayo.pos.repository.MenuItemVariationRepository menuItemVariationRepository;
    
    public List<MenuItemDTO> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .sorted((a, b) -> a.getId().compareTo(b.getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MenuItemDTO> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrueOrderByIdAsc().stream()
                .filter(item -> !item.getComboOnly())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MenuItemDTO> getMenuItemsByCategory(String category) {
        return menuItemRepository.findByCategoryAndAvailableTrueOrderByIdAsc(category).stream()
                .filter(item -> !item.getComboOnly())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }
    
    public MenuItem saveMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }
    
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }
    
    public List<String> getAllCategories() {
        return menuItemRepository.findAll().stream()
                .map(MenuItem::getCategory)
                .distinct()
                .sorted()
                .toList();
    }

    public Optional<com.dattebayo.pos.model.MenuItemVariation> getVariationById(Long id) {
        return menuItemVariationRepository.findById(id);
    }

    public com.dattebayo.pos.model.MenuItemVariation saveVariation(com.dattebayo.pos.model.MenuItemVariation variation) {
        return menuItemVariationRepository.save(variation);
    }

    @Transactional
    public void updateStockBatch(StockBatchUpdateDTO batchUpdate) {
        if (batchUpdate.getItems() != null) {
            for (StockBatchUpdateDTO.StockUpdateItem itemUpdate : batchUpdate.getItems()) {
                menuItemRepository.findById(itemUpdate.getId()).ifPresent(item -> {
                    item.setStockQuantity(itemUpdate.getStockQuantity());
                    menuItemRepository.save(item);
                });
            }
        }
        if (batchUpdate.getVariations() != null) {
            for (StockBatchUpdateDTO.StockUpdateItem variationUpdate : batchUpdate.getVariations()) {
                menuItemVariationRepository.findById(variationUpdate.getId()).ifPresent(variation -> {
                    variation.setStockQuantity(variationUpdate.getStockQuantity());
                    menuItemVariationRepository.save(variation);
                });
            }
        }
    }

    @Transactional
    public void updateMenuBatch(MenuBatchUpdateDTO batchUpdate) {
        if (batchUpdate.getItems() != null) {
            for (MenuBatchUpdateDTO.MenuUpdateItem itemUpdate : batchUpdate.getItems()) {
                menuItemRepository.findById(itemUpdate.getId()).ifPresent(item -> {
                    if (itemUpdate.getAvailable() != null) {
                        item.setAvailable(itemUpdate.getAvailable());
                    }
                    if (itemUpdate.getManualPrice() != null) {
                        item.setManualPrice(itemUpdate.getManualPrice());
                    }
                    if (itemUpdate.getManualPriceEnabled() != null) {
                        item.setManualPriceEnabled(itemUpdate.getManualPriceEnabled());
                    }
                    menuItemRepository.save(item);
                });
            }
        }
    }

    private MenuItemDTO convertToDTO(MenuItem menuItem) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(menuItem.getId());
        dto.setName(menuItem.getName());
        dto.setDescription(menuItem.getDescription());
        dto.setCategory(menuItem.getCategory());
        dto.setAvailable(menuItem.getAvailable());
        dto.setBasePrice(menuItem.getPrice());
        dto.setManualPrice(menuItem.getManualPrice());
        dto.setManualPriceEnabled(menuItem.getManualPriceEnabled());
        dto.setStockQuantity(menuItem.getStockQuantity());
        dto.setComboOnly(menuItem.getComboOnly());
        Double basePrice = (menuItem.getManualPriceEnabled() && menuItem.getManualPrice() != null) 
                ? menuItem.getManualPrice() 
                : menuItem.getPrice();
        
        dto.setPrice(Math.round(basePrice * 100.0) / 100.0); // Round to 2 decimal places if needed, or keep as is

        List<MenuItemVariationDTO> variationDTOs = menuItem.getVariations().stream()
                .map(variation -> {
                    MenuItemVariationDTO variationDTO = new MenuItemVariationDTO();
                    variationDTO.setId(variation.getId());
                    variationDTO.setName(variation.getName());
                    variationDTO.setType(variation.getType());
                    
                    Double additionalPrice = variation.getAdditionalPrice();
                    variationDTO.setAdditionalPrice(Math.round(additionalPrice * 100.0) / 100.0);
                    variationDTO.setStockQuantity(variation.getStockQuantity());
                    variationDTO.setStockMultiplier(variation.getStockMultiplier());
                    
                    return variationDTO;
                })
                .collect(Collectors.toList());
        dto.setVariations(variationDTOs);

        return dto;
    }
}
