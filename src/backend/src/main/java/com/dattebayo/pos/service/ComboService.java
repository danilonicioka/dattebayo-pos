package com.dattebayo.pos.service;

import com.dattebayo.pos.dto.ComboDTO;
import com.dattebayo.pos.dto.ComboItemDTO;
import com.dattebayo.pos.dto.CreateComboDTO;
import com.dattebayo.pos.model.Combo;
import com.dattebayo.pos.model.ComboItem;
import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.model.MenuItemVariation;
import com.dattebayo.pos.repository.ComboRepository;
import com.dattebayo.pos.repository.MenuItemRepository;
import com.dattebayo.pos.repository.MenuItemVariationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComboService {

    @Autowired
    private ComboRepository comboRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private MenuItemVariationRepository menuItemVariationRepository;

    public List<ComboDTO> getAllCombos() {
        return comboRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ComboDTO> getAvailableCombos() {
        return comboRepository.findByAvailableTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ComboDTO> getComboById(Long id) {
        return comboRepository.findById(id).map(this::convertToDTO);
    }

    public Combo getComboEntityById(Long id) {
        return comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found: " + id));
    }

    public ComboDTO createCombo(CreateComboDTO dto) {
        Combo combo = new Combo();
        applyDTOToCombo(dto, combo);
        return convertToDTO(comboRepository.save(combo));
    }

    public ComboDTO updateCombo(Long id, CreateComboDTO dto) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found: " + id));
        combo.getItems().clear();
        applyDTOToCombo(dto, combo);
        return convertToDTO(comboRepository.save(combo));
    }

    public void deleteCombo(Long id) {
        comboRepository.deleteById(id);
    }

    public ComboDTO toggleAvailability(Long id, boolean available) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found: " + id));
        combo.setAvailable(available);
        return convertToDTO(comboRepository.save(combo));
    }

    // ── internal helpers ─────────────────────────────────────────────────────

    private void applyDTOToCombo(CreateComboDTO dto, Combo combo) {
        combo.setName(dto.getName());
        combo.setDescription(dto.getDescription());
        combo.setPrice(dto.getPrice());
        combo.setAvailable(dto.getAvailable() != null ? dto.getAvailable() : true);

        if (dto.getItems() != null) {
            for (ComboItemDTO itemDTO : dto.getItems()) {
                MenuItem menuItem = menuItemRepository.findById(itemDTO.getMenuItemId())
                        .orElseThrow(() -> new RuntimeException("MenuItem not found: " + itemDTO.getMenuItemId()));
                
                ComboItem ci = new ComboItem();
                ci.setCombo(combo);
                ci.setMenuItem(menuItem);
                ci.setQuantity(itemDTO.getQuantity() != null ? itemDTO.getQuantity() : 1);
                
                if (itemDTO.getAllowedVariationIds() != null) {
                    for (Long vId : itemDTO.getAllowedVariationIds()) {
                        MenuItemVariation variation = menuItemVariationRepository.findById(vId)
                                .orElseThrow(() -> new RuntimeException("Variation not found: " + vId));
                        ci.getAllowedVariations().add(variation);
                    }
                }
                
                combo.getItems().add(ci);
            }
        }
    }

    public ComboDTO convertToDTO(Combo combo) {
        ComboDTO dto = new ComboDTO();
        dto.setId(combo.getId());
        dto.setName(combo.getName());
        dto.setDescription(combo.getDescription());
        dto.setPrice(combo.getPrice());
        dto.setAvailable(combo.getAvailable());
        dto.setItems(combo.getItems().stream().map(ci -> {
            ComboItemDTO ciDTO = new ComboItemDTO();
            ciDTO.setMenuItemId(ci.getMenuItem().getId());
            ciDTO.setMenuItemName(ci.getMenuItem().getName());
            if (ci.getAllowedVariations() != null) {
                ciDTO.setAllowedVariationIds(ci.getAllowedVariations().stream()
                        .map(MenuItemVariation::getId)
                        .collect(Collectors.toList()));
                
                ciDTO.setAllowedVariations(ci.getAllowedVariations().stream()
                        .map(v -> {
                            com.dattebayo.pos.dto.MenuItemVariationDTO vDTO = new com.dattebayo.pos.dto.MenuItemVariationDTO();
                            vDTO.setId(v.getId());
                            vDTO.setName(v.getName());
                            vDTO.setType(v.getType());
                            vDTO.setAdditionalPrice(v.getAdditionalPrice());
                            vDTO.setStockMultiplier(v.getStockMultiplier());
                            vDTO.setStockQuantity(v.getStockQuantity());
                            return vDTO;
                        })
                        .collect(Collectors.toList()));
            }
            ciDTO.setQuantity(ci.getQuantity());
            return ciDTO;
        }).collect(Collectors.toList()));
        return dto;
    }
}
