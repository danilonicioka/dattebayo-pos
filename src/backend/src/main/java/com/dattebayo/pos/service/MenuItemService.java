package com.dattebayo.pos.service;

import com.dattebayo.pos.dto.MenuItemDTO;
import com.dattebayo.pos.dto.MenuItemVariationDTO;
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
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MenuItemDTO> getMenuItemsByCategory(String category) {
        return menuItemRepository.findByCategoryAndAvailableTrueOrderByIdAsc(category).stream()
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
        dto.setApplyMarkup(menuItem.getApplyMarkup());
        dto.setStockQuantity(menuItem.getStockQuantity());

        Double basePrice = (menuItem.getManualPriceEnabled() && menuItem.getManualPrice() != null) 
                ? menuItem.getManualPrice() 
                : menuItem.getPrice();
        
        dto.setPrice(menuItem.getApplyMarkup() ? configurationService.applyMarkup(basePrice) : Math.round(basePrice));

        List<MenuItemVariationDTO> variationDTOs = menuItem.getVariations().stream()
                .map(variation -> {
                    MenuItemVariationDTO variationDTO = new MenuItemVariationDTO();
                    variationDTO.setId(variation.getId());
                    variationDTO.setName(variation.getName());
                    variationDTO.setType(variation.getType());
                    
                    Double additionalPrice = variation.getAdditionalPrice();
                    variationDTO.setAdditionalPrice(menuItem.getApplyMarkup() ? configurationService.applyMarkup(additionalPrice) : Math.round(additionalPrice));
                    variationDTO.setStockQuantity(variation.getStockQuantity());
                    
                    return variationDTO;
                })
                .collect(Collectors.toList());
        dto.setVariations(variationDTOs);

        return dto;
    }
}
