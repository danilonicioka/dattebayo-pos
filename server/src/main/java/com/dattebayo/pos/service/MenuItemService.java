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
    
    public List<MenuItemDTO> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .sorted((a, b) -> a.getId().compareTo(b.getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MenuItemDTO> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MenuItemDTO> getMenuItemsByCategory(String category) {
        return menuItemRepository.findByCategoryAndAvailableTrue(category).stream()
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
                    
                    return variationDTO;
                })
                .collect(Collectors.toList());
        dto.setVariations(variationDTOs);

        return dto;
    }
}
