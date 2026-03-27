package com.dattebayo.pos.controller.api;

import com.dattebayo.pos.dto.ComboDTO;
import com.dattebayo.pos.dto.CreateComboDTO;
import com.dattebayo.pos.service.ComboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/combos")
@CrossOrigin(origins = "*")
public class ComboApiController {

    @Autowired
    private ComboService comboService;

    @GetMapping
    public ResponseEntity<List<ComboDTO>> getAllCombos() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }

    @GetMapping("/available")
    public ResponseEntity<List<ComboDTO>> getAvailableCombos() {
        return ResponseEntity.ok(comboService.getAvailableCombos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboDTO> getComboById(@PathVariable Long id) {
        return comboService.getComboById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ComboDTO> createCombo(@RequestBody CreateComboDTO dto) {
        return ResponseEntity.ok(comboService.createCombo(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComboDTO> updateCombo(@PathVariable Long id, @RequestBody CreateComboDTO dto) {
        return ResponseEntity.ok(comboService.updateCombo(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id) {
        comboService.deleteCombo(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/available")
    public ResponseEntity<ComboDTO> toggleAvailability(@PathVariable Long id, @RequestBody Map<String, Boolean> payload) {
        if (!payload.containsKey("available")) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(comboService.toggleAvailability(id, payload.get("available")));
    }
}
