package com.dattebayo.pos.service;

import com.dattebayo.pos.dto.*;
import com.dattebayo.pos.model.*;
import com.dattebayo.pos.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private MenuItemVariationRepository menuItemVariationRepository;

    @Autowired
    private OrderItemVariationRepository orderItemVariationRepository;

    @Autowired
    private ConfigurationService configurationService;

    public OrderDTO createOrder(CreateOrderDTO createOrderDTO) {
        Order order = new Order();
        order.setTableNumber(createOrderDTO.getTableNumber());
        order.setNotes(createOrderDTO.getNotes());
        order.setStatus(Order.OrderStatus.PENDING);

        for (var itemRequest : createOrderDTO.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemRequest.getMenuItemId()));

            if (!menuItem.getAvailable()) {
                throw new RuntimeException("Menu item is not available: " + menuItem.getName());
            }

            // Check and update stock
            if (menuItem.getStockQuantity() != null) {
                int quantityToDeduct = itemRequest.getQuantity();

                // Custom logic for "Camarão Milanesa"
                if ("Camarão Milanesa".equals(menuItem.getName()) && itemRequest.getVariations() != null) {
                    for (var variationRequest : itemRequest.getVariations()) {
                        if (variationRequest.getSelected()) {
                            // Fetch variation name to check type
                            MenuItemVariation variation = menuItemVariationRepository.findById(variationRequest.getMenuItemVariationId())
                                .orElse(null);
                            
                            if (variation != null) {
                                int varQty = variationRequest.getQuantity() != null ? variationRequest.getQuantity() : 1;
                                if ("Porção com 5 unidades".equals(variation.getName())) {
                                    quantityToDeduct = itemRequest.getQuantity() * 5 * varQty;
                                    break;
                                } else if ("Unidade".equals(variation.getName())) {
                                    quantityToDeduct = itemRequest.getQuantity() * varQty;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (menuItem.getStockQuantity() < quantityToDeduct) {
                    throw new RuntimeException("Estoque insuficiente para: " + menuItem.getName() + " (Restante: " + menuItem.getStockQuantity() + ")");
                }
                menuItem.setStockQuantity(menuItem.getStockQuantity() - quantityToDeduct);
                menuItemRepository.save(menuItem);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            Double basePrice = (menuItem.getManualPriceEnabled() && menuItem.getManualPrice() != null)
                    ? menuItem.getManualPrice()
                    : menuItem.getPrice();
            orderItem.setPrice(
                    menuItem.getApplyMarkup() ? configurationService.applyMarkup(basePrice) : Math.round(basePrice));
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

            // Handle variations and pricing
            if (itemRequest.getVariations() != null) {
                for (var variationRequest : itemRequest.getVariations()) {
                    addVariationToOrderItem(orderItem, variationRequest);
                }
            }

            order.getItems().add(orderItem);
        }

        order = orderRepository.save(order);
        return convertToDTO(order);
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtAsc(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getKitchenOrders() {
        List<Order.OrderStatus> kitchenStatuses = List.of(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.PREPARING);
        return orderRepository.findByStatusInOrderByCreatedAtAsc(kitchenStatuses).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getHistoryOrders() {
        // Return both COMPLETED and CANCELLED orders for history
        List<Order.OrderStatus> historyStatuses = List.of(
                Order.OrderStatus.COMPLETED,
                Order.OrderStatus.CANCELLED);
        return orderRepository.findByStatusInOrderByCreatedAtDesc(historyStatuses).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Maintain getCompletedOrders for Sales Summary (revenue calculation)
    public List<OrderDTO> getCompletedOrders() {
        return orderRepository.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.COMPLETED).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void clearOrderHistory() {
        orderRepository.deleteByStatus(Order.OrderStatus.COMPLETED);
        orderRepository.deleteByStatus(Order.OrderStatus.CANCELLED);
    }

    public OrderDTO updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        return convertToDTO(order);
    }
    
    public OrderDTO cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getStatus() == Order.OrderStatus.COMPLETED || order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel an order that is already completed or cancelled");
        }

        // Restore Stock
        for (OrderItem item : order.getItems()) {
            // Restore MenuItem Stock
            if (item.getMenuItem().getStockQuantity() != null) {
                // If it's Camarão Milanesa, we need to check variations for custom deduction logic restoration
                 if ("Camarão Milanesa".equals(item.getMenuItem().getName()) && item.getVariations() != null) {
                    boolean handledCustom = false;
                    for (OrderItemVariation itemVariation : item.getVariations()) {
                         if (itemVariation.getSelected()) {
                             MenuItemVariation variation = itemVariation.getMenuItemVariation();
                             int varQty = itemVariation.getQuantity() != null ? itemVariation.getQuantity() : 1;
                             
                             if ("Porção com 5 unidades".equals(variation.getName())) {
                                 // It deducted 5 per item quantity * var quantity
                                 item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + (item.getQuantity() * 5 * varQty));
                                 menuItemRepository.save(item.getMenuItem());
                                 handledCustom = true;
                                 break;
                             } else if ("Unidade".equals(variation.getName())) {
                                 item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + (item.getQuantity() * varQty));
                                 menuItemRepository.save(item.getMenuItem());
                                 handledCustom = true;
                                 break;
                             }
                         }
                    }
                    if (!handledCustom) {
                        // Fallback logic
                        item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + item.getQuantity());
                        menuItemRepository.save(item.getMenuItem());
                    }
                } else {
                    // Standard Logic
                    item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + item.getQuantity());
                     menuItemRepository.save(item.getMenuItem());
                }
            }

            // Restore Variation Stock
            for (OrderItemVariation itemVariation : item.getVariations()) {
                MenuItemVariation variation = itemVariation.getMenuItemVariation();
                if (variation.getStockQuantity() != null) {
                    int qtyToRestore = item.getQuantity() * itemVariation.getQuantity();
                    variation.setStockQuantity(variation.getStockQuantity() + qtyToRestore);
                    menuItemVariationRepository.save(variation);
                }
            }
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        return convertToDTO(order);
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        return convertToDTO(order);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setTableNumber(order.getTableNumber());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setNotes(order.getNotes());

        double total = 0.0;
        for (OrderItem item : order.getItems()) {
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setMenuItemId(item.getMenuItem().getId());

            // Build display name including selected variations
            List<String> selectedVariationNames = item.getVariations().stream()
                    .filter(OrderItemVariation::getSelected)
                    .map(variation -> {
                        String name = variation.getMenuItemVariation().getName();
                        if (variation.getQuantity() != null && variation.getQuantity() > 1) {
                            return variation.getQuantity() + "x " + name;
                        }
                        return name;
                    })
                    .collect(Collectors.toList());

            String displayName;
            // Default quantity and price
            int displayQuantity = item.getQuantity();
            double displayPrice = item.getPrice();

            if ("Comidas".equals(item.getMenuItem().getCategory()) && "Tempurá".equalsIgnoreCase(item.getMenuItem().getName())) {
                boolean hasShrimp = item.getVariations().stream()
                    .filter(OrderItemVariation::getSelected)
                    .anyMatch(v -> {
                         String vName = v.getMenuItemVariation().getName();
                         return vName != null && "Com Camarão".equalsIgnoreCase(vName.trim());
                    });
                displayName = hasShrimp ? "Tempurá Com Camarão" : "Tempurá De Legumes";
            } else if ("Comidas".equals(item.getMenuItem().getCategory())
                    && item.getMenuItem().getName().equals("Yakisoba")) {
                boolean hasShrimp = selectedVariationNames.contains("Com Camarão");
                displayName = hasShrimp ? "Yakisoba Com Camarão" : "Yakisoba Simples";
            } else if ("Comidas".equals(item.getMenuItem().getCategory())
                    && "Hot Sushi".equals(item.getMenuItem().getName())) {
                if (selectedVariationNames.size() > 1) {
                    displayName = "Hot Sushi (" + String.join(" + ", selectedVariationNames) + ")";
                } else {
                    displayName = selectedVariationNames.isEmpty()
                            ? item.getMenuItem().getName()
                            : "Hot Sushi (" + String.join(", ", selectedVariationNames) + ")";
                }
            } else if ("Comidas".equals(item.getMenuItem().getCategory())
                    && item.getMenuItem().getName().equals("Pastel")) {
                displayName = selectedVariationNames.isEmpty()
                        ? item.getMenuItem().getName()
                        : "Pastel (" + String.join(" + ", selectedVariationNames) + ")";
            } else if ("Camarão Milanesa".equals(item.getMenuItem().getName())) {
                String specificDisplayName = null;
                Integer overrideQty = null;
                
                for (var v : item.getVariations()) {
                    if (v.getSelected()) {
                         int vQty = v.getQuantity() != null ? v.getQuantity() : 1;
                         int totalLineQty = vQty * item.getQuantity();
                         
                         if ("Porção com 5 unidades".equals(v.getMenuItemVariation().getName())) {
                             int totalUnits = totalLineQty * 5;
                             specificDisplayName = "Porção de Camarão (" + totalUnits + " unidades)";
                             overrideQty = totalLineQty;
                             break;
                         } else if ("Unidade".equals(v.getMenuItemVariation().getName())) {
                             specificDisplayName = "Unidade de Camarão Milanesa";
                             overrideQty = totalLineQty;
                             break;
                         }
                    }
                }
                
                if (specificDisplayName != null) {
                    displayName = specificDisplayName;
                } else {
                     // Fallback
                     displayName = item.getMenuItem().getName();
                }

                if (overrideQty != null && overrideQty > 0) {
                    displayQuantity = overrideQty;
                    // Recalculate unit price based on the override quantity
                    // Logic: Total Price / Total Display Units
                    // Total Price = item.getPrice() * item.getQuantity()
                    displayPrice = (item.getPrice() * item.getQuantity()) / overrideQty;
                }
            } else {
                displayName = selectedVariationNames.isEmpty()
                        ? item.getMenuItem().getName()
                        : item.getMenuItem().getName() + " (" + String.join(", ", selectedVariationNames) + ")";
            }

            itemDTO.setMenuItemName(displayName);
            itemDTO.setQuantity(displayQuantity);
            itemDTO.setPrice(displayPrice);

            itemDTO.setSpecialInstructions(item.getSpecialInstructions());
            // Use subtotal from original calculations to avoid floating point issues when multiplying back
            itemDTO.setSubtotal(item.getPrice() * item.getQuantity());

            // Convert variations
            List<OrderItemVariationDTO> variationDTOs = item.getVariations().stream()
                    .map(variation -> {
                        OrderItemVariationDTO variationDTO = new OrderItemVariationDTO();
                        variationDTO.setId(variation.getId());
                        variationDTO.setName(variation.getMenuItemVariation().getName());
                        variationDTO.setType(variation.getMenuItemVariation().getType());
                        variationDTO.setAdditionalPrice(variation.getMenuItemVariation().getAdditionalPrice());
                        variationDTO.setSelected(variation.getSelected());
                        variationDTO.setQuantity(variation.getQuantity());
                        return variationDTO;
                    })
                    .collect(Collectors.toList());
            itemDTO.setVariations(variationDTOs);

            total += itemDTO.getSubtotal();
            dto.getItems().add(itemDTO);
        }

        dto.setTotal(total);
        return dto;
    }

    public OrderDTO updateOrder(Long orderId, CreateOrderDTO createOrderDTO) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // Only allow updating orders that are not completed
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("Cannot update a completed order");
        }

        // Update basic order info
        order.setTableNumber(createOrderDTO.getTableNumber());
        order.setNotes(createOrderDTO.getNotes());

        // Clear existing order items and variations
        for (OrderItem item : order.getItems()) {
            // Revert stock for removed items
            if (item.getMenuItem().getStockQuantity() != null) {
                item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + item.getQuantity());
                menuItemRepository.save(item.getMenuItem());
            }

            // Revert stock for removed variations
            for (OrderItemVariation itemVariation : item.getVariations()) {
                MenuItemVariation variation = itemVariation.getMenuItemVariation();
                if (variation.getStockQuantity() != null) {
                    int qtyToRevert = item.getQuantity() * itemVariation.getQuantity();
                    variation.setStockQuantity(variation.getStockQuantity() + qtyToRevert);
                    menuItemVariationRepository.save(variation);
                }
            }
            
            orderItemVariationRepository.deleteAll(item.getVariations());
        }
        order.getItems().clear();

        // Add new order items
        for (var itemRequest : createOrderDTO.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemRequest.getMenuItemId()));

            if (!menuItem.getAvailable()) {
                throw new RuntimeException("Menu item is not available: " + menuItem.getName());
            }

            // Check and update stock (for updated order)
            if (menuItem.getStockQuantity() != null) {
                int quantityToDeduct = itemRequest.getQuantity();
                
                // Custom logic for "Camarão Milanesa"
                if ("Camarão Milanesa".equals(menuItem.getName()) && itemRequest.getVariations() != null) {
                    for (var variationRequest : itemRequest.getVariations()) {
                        if (variationRequest.getSelected()) {
                            // Fetch variation name to check type
                            MenuItemVariation variation = menuItemVariationRepository.findById(variationRequest.getMenuItemVariationId())
                                .orElse(null);
                            
                            if (variation != null) {
                                int varQty = variationRequest.getQuantity() != null ? variationRequest.getQuantity() : 1;
                                if ("Porção com 5 unidades".equals(variation.getName())) {
                                    quantityToDeduct = itemRequest.getQuantity() * 5 * varQty;
                                    break;
                                } else if ("Unidade".equals(variation.getName())) {
                                    quantityToDeduct = itemRequest.getQuantity() * varQty;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (menuItem.getStockQuantity() < quantityToDeduct) {
                    // Start transaction rollback by runtime exception
                    throw new RuntimeException("Estoque insuficiente para: " + menuItem.getName() + " (Restante: " + menuItem.getStockQuantity() + ")");
                }
                menuItem.setStockQuantity(menuItem.getStockQuantity() - quantityToDeduct);
                menuItemRepository.save(menuItem);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            Double basePrice = (menuItem.getManualPriceEnabled() && menuItem.getManualPrice() != null)
                    ? menuItem.getManualPrice()
                    : menuItem.getPrice();
            orderItem.setPrice(
                    menuItem.getApplyMarkup() ? configurationService.applyMarkup(basePrice) : Math.round(basePrice));
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

            // Handle variations and pricing
            if (itemRequest.getVariations() != null) {
                for (var variationRequest : itemRequest.getVariations()) {
                    addVariationToOrderItem(orderItem, variationRequest);
                }
            }

            order.getItems().add(orderItem);
        }

        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        return convertToDTO(savedOrder);
    }

    private void addVariationToOrderItem(OrderItem orderItem, OrderItemVariationRequestDTO variationRequest) {
        MenuItemVariation variation = menuItemVariationRepository.findById(variationRequest.getMenuItemVariationId())
                .orElseThrow(() -> new RuntimeException(
                        "Menu item variation not found: " + variationRequest.getMenuItemVariationId()));

        // Validate that the variation belongs to the menu item
        if (!variation.getMenuItem().getId().equals(orderItem.getMenuItem().getId())) {
            throw new RuntimeException("Variation does not belong to the selected menu item");
        }

        OrderItemVariation orderItemVariation = new OrderItemVariation();
        orderItemVariation.setOrderItem(orderItem);
        orderItemVariation.setMenuItemVariation(variation);
        orderItemVariation.setSelected(variationRequest.getSelected());

        // Handle quantity
        int variationQty = variationRequest.getQuantity() != null && variationRequest.getQuantity() > 0
                ? variationRequest.getQuantity()
                : 1;
        orderItemVariation.setQuantity(variationQty);

        orderItem.getVariations().add(orderItemVariation);

        // Add additional price if variation is selected, multiplying by quantity
        if (variationRequest.getSelected()) {
            // Check and update stock for variation
            if (variation.getStockQuantity() != null) {
                int totalRequired = orderItem.getQuantity() * variationQty;
                if (variation.getStockQuantity() < totalRequired) {
                    throw new RuntimeException("Estoque insuficiente para variação: " + variation.getName() + 
                            " (Item: " + variation.getMenuItem().getName() + ") - Restante: " + variation.getStockQuantity());
                }
                variation.setStockQuantity(variation.getStockQuantity() - totalRequired);
                menuItemVariationRepository.save(variation);
            }

            Double additionalPrice = variation.getAdditionalPrice();
            
            // Smart Pricing for Camarão Milanesa Units
            // Fix: Check total units (Item Qty * Var Qty) because frontend normalizes items to Qty=N, VarQty=1
            int totalUnits = orderItem.getQuantity() * variationQty;
            
            if ("Camarão Milanesa".equals(orderItem.getMenuItem().getName()) && "Unidade".equals(variation.getName()) && totalUnits >= 5) {
                 Optional<MenuItemVariation> portionVar = orderItem.getMenuItem().getVariations().stream()
                     .filter(v -> "Porção com 5 unidades".equals(v.getName()))
                     .findFirst();
                 
                 if (portionVar.isPresent()) {
                     int portions = totalUnits / 5;
                     int remainder = totalUnits % 5;
                     
                     Double portionPrice = portionVar.get().getAdditionalPrice();
                     Double effectiveTotalPrice = (portions * portionPrice) + (remainder * additionalPrice);
                     
                     // Apply markup if needed to the *calculated* total variation price
                     Double processedEffectiveTotal = orderItem.getMenuItem().getApplyMarkup()
                         ? configurationService.applyMarkup(effectiveTotalPrice)
                         : Math.round(effectiveTotalPrice);
                         
                     // We need to set the price PER ORDER ITEM.
                     // The orderItem.price will be multiplied by orderItem.quantity later in calculations.
                     // So we divide the total calculated price by the item quantity.
                     orderItem.setPrice(processedEffectiveTotal / orderItem.getQuantity());
                     return; // Early return as we utilized custom logic
                 }
            }

            Double processedAdditional = orderItem.getMenuItem().getApplyMarkup()
                    ? configurationService.applyMarkup(additionalPrice)
                    : Math.round(additionalPrice);
            // Multiply the additional price by the quantity of this variation
            // AND add to existing price (base price usually 0 for this item)
            orderItem.setPrice(orderItem.getPrice() + (processedAdditional * variationQty));
        }
    }
}
