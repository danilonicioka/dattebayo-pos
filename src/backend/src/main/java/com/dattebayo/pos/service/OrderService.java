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

    @Autowired
    private SocketService socketService;

    public OrderDTO createOrder(CreateOrderDTO createOrderDTO) {
        Order order = new Order();
        order.setTableNumber(createOrderDTO.getTableNumber());
        order.setNotes(createOrderDTO.getNotes());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentMethod(createOrderDTO.getPaymentMethod());
        order.setAmountReceived(createOrderDTO.getAmountReceived());

        for (var itemRequest : createOrderDTO.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemRequest.getMenuItemId()));

            if (!menuItem.getAvailable()) {
                throw new RuntimeException("Menu item is not available: " + menuItem.getName());
            }

            // Check and update stock
            if (menuItem.getStockQuantity() != null) {
                int quantityToDeduct = itemRequest.getQuantity();

                // Generic logic for stock deduction based on variation multipliers
                if (itemRequest.getVariations() != null) {
                    for (var variationRequest : itemRequest.getVariations()) {
                        if (variationRequest.getSelected()) {
                            MenuItemVariation variation = menuItemVariationRepository.findById(variationRequest.getMenuItemVariationId())
                                .orElse(null);
                            
                            if (variation != null && variation.getStockMultiplier() != null && variation.getStockMultiplier() > 1) {
                                int varQty = variationRequest.getQuantity() != null ? variationRequest.getQuantity() : 1;
                                // Multiply base quantity by variation multiplier
                                quantityToDeduct = itemRequest.getQuantity() * variation.getStockMultiplier() * varQty;
                                break; // Found the primary stock-affecting variation
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
            orderItem.setPrice(Math.round(basePrice * 100.0) / 100.0);
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());

            // Handle variations and pricing
            if (itemRequest.getVariations() != null) {
                for (var variationRequest : itemRequest.getVariations()) {
                    addVariationToOrderItem(orderItem, variationRequest);
                }
            }

            order.getItems().add(orderItem);
        }
        
        // Calculate total for change calculation if payment is cash
        double total = 0;
        for (OrderItem item : order.getItems()) {
            total += item.getPrice() * item.getQuantity();
        }
        
        if (order.getAmountReceived() != null && order.getAmountReceived() > 0) {
            order.setChangeAmount(Math.max(0, order.getAmountReceived() - total));
        } else {
            order.setChangeAmount(0.0);
        }

        // Validate mandatory variations before saving
        validateMandatoryVariations(order);

        order = orderRepository.save(order);
        socketService.broadcastOrderUpdate();
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

    public void concludeAllActiveOrders() {
        List<Order.OrderStatus> activeStatuses = List.of(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.PREPARING,
                Order.OrderStatus.READY);
        List<Order> activeOrders = orderRepository.findByStatusInOrderByCreatedAtAsc(activeStatuses);
        for (Order order : activeOrders) {
            order.setStatus(Order.OrderStatus.COMPLETED);
            order.setUpdatedAt(LocalDateTime.now());
        }
        orderRepository.saveAll(activeOrders);
    }

    public OrderDTO updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        order = orderRepository.save(order);
        socketService.broadcastOrderUpdate();

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
                 // Generic stock restoration logic using variation multipliers
                 if (item.getVariations() != null) {
                    boolean handledCustom = false;
                    for (OrderItemVariation itemVariation : item.getVariations()) {
                         if (itemVariation.getSelected()) {
                             MenuItemVariation variation = itemVariation.getMenuItemVariation();
                             int varQty = itemVariation.getQuantity() != null ? itemVariation.getQuantity() : 1;
                             
                             if (variation.getStockMultiplier() != null && variation.getStockMultiplier() > 1) {
                                 item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + (item.getQuantity() * variation.getStockMultiplier() * varQty));
                                 menuItemRepository.save(item.getMenuItem());
                                 handledCustom = true;
                                 break;
                             }
                         }
                    }
                    if (!handledCustom) {
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
        socketService.broadcastOrderUpdate();

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
        dto.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setNotes(order.getNotes());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setAmountReceived(order.getAmountReceived());
        dto.setChangeAmount(order.getChangeAmount());

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
            displayName = item.getMenuItem().getName();
            if (!selectedVariationNames.isEmpty()) {
                if (displayName.toLowerCase().contains("pastel")) {
                    displayName += " De " + String.join(" + ", selectedVariationNames);
                } else if ("Camarão Milanesa".equals(displayName)) {
                    displayName = String.join(" + ", selectedVariationNames) + " De " + displayName;
                } else {
                    displayName += " " + String.join(" + ", selectedVariationNames);
                }
            } else if (!item.getMenuItem().getVariations().isEmpty()) {
                // If variations are mandatory but missing (legacy data), 
                // we just show the base name to avoid crashing.
                // Log or handle as needed.
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
                // Generic stock restoration logic using variation multipliers
                if (item.getVariations() != null) {
                    boolean handledCustom = false;
                    for (OrderItemVariation itemVariation : item.getVariations()) {
                        if (itemVariation.getSelected()) {
                            MenuItemVariation variation = itemVariation.getMenuItemVariation();
                            int varQty = itemVariation.getQuantity() != null ? itemVariation.getQuantity() : 1;
                            
                            if (variation.getStockMultiplier() != null && variation.getStockMultiplier() > 1) {
                                item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + (item.getQuantity() * variation.getStockMultiplier() * varQty));
                                menuItemRepository.save(item.getMenuItem());
                                handledCustom = true;
                                break;
                            }
                        }
                    }
                    if (!handledCustom) {
                        item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + item.getQuantity());
                        menuItemRepository.save(item.getMenuItem());
                    }
                } else {
                    item.getMenuItem().setStockQuantity(item.getMenuItem().getStockQuantity() + item.getQuantity());
                    menuItemRepository.save(item.getMenuItem());
                }
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
                
                // Generic stock deduction logic using variation multipliers
                if (itemRequest.getVariations() != null) {
                    for (var variationRequest : itemRequest.getVariations()) {
                        if (variationRequest.getSelected()) {
                            MenuItemVariation variation = menuItemVariationRepository.findById(variationRequest.getMenuItemVariationId())
                                .orElse(null);
                            
                            if (variation != null && variation.getStockMultiplier() != null && variation.getStockMultiplier() > 1) {
                                int varQty = variationRequest.getQuantity() != null ? variationRequest.getQuantity() : 1;
                                quantityToDeduct = itemRequest.getQuantity() * variation.getStockMultiplier() * varQty;
                                break;
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
            orderItem.setPrice(Math.round(basePrice * 100.0) / 100.0);
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
        
        // Validate mandatory variations before saving
        validateMandatoryVariations(order);

        Order savedOrder = orderRepository.save(order);
        socketService.broadcastOrderUpdate();

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
                     
                     Double processedEffectiveTotal = Math.round(effectiveTotalPrice * 100.0) / 100.0;
                         
                     // We need to set the price PER ORDER ITEM.
                     // The orderItem.price will be multiplied by orderItem.quantity later in calculations.
                     // So we divide the total calculated price by the item quantity.
                     orderItem.setPrice(processedEffectiveTotal / orderItem.getQuantity());
                     return; // Early return as we utilized custom logic
                 }
            }

            Double processedAdditional = Math.round(additionalPrice * 100.0) / 100.0;
            // Multiply the additional price by the quantity of this variation
            // AND add to existing price (base price usually 0 for this item)
            orderItem.setPrice(orderItem.getPrice() + (processedAdditional * variationQty));
        }
    }

    private void validateMandatoryVariations(Order order) {
        for (OrderItem item : order.getItems()) {
            MenuItem menuItem = item.getMenuItem();
            if (menuItem.getVariations() != null && !menuItem.getVariations().isEmpty()) {
                // Check if at least one variation is selected for each type that exists
                // Currently we only have SINGLE and MULTIPLE, if there are variations, 
                // we expect at least one selection if any of them are SINGLE.
                boolean hasSingleType = menuItem.getVariations().stream()
                        .anyMatch(v -> "SINGLE".equals(v.getType()));
                
                boolean selectionMade = item.getVariations().stream()
                        .anyMatch(OrderItemVariation::getSelected);
                
                if (selectionMade) continue; // Basic check: at least one thing must be selected if variations exist

                // If no selection was made but variations exist, we throw here (at creation/update time)
                throw new RuntimeException("Seleção obrigatória para: " + menuItem.getName());
            }
        }
    }

    public List<OrderDTO> getCompletedOrders() {
        return orderRepository.findByStatusInOrderByCreatedAtAsc(List.of(Order.OrderStatus.COMPLETED)).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Map<String, List<com.dattebayo.pos.dto.ItemSalesSummaryDTO>> getSalesSummaryByCategory(List<OrderDTO> completedOrders, List<com.dattebayo.pos.dto.MenuItemDTO> allMenuItems) {
        // Get all menu items to map IDs to Categories
        Map<String, String> itemCategories = allMenuItems.stream()
                .collect(Collectors.toMap(com.dattebayo.pos.dto.MenuItemDTO::getName, com.dattebayo.pos.dto.MenuItemDTO::getCategory, (existing, replacement) -> existing));

        // Group sales by Category
        Map<String, Map<String, com.dattebayo.pos.dto.ItemSalesSummaryDTO>> tempGroupedStats = new java.util.HashMap<>();

        for (OrderDTO order : completedOrders) {
            if (order.getItems() == null) continue;
            for (com.dattebayo.pos.dto.OrderItemDTO item : order.getItems()) {
                String itemName = item.getMenuItemName();
                if (itemName == null) continue;
                String category = itemCategories.getOrDefault(itemName, "Outros");

                tempGroupedStats.putIfAbsent(category, new java.util.HashMap<>());
                Map<String, com.dattebayo.pos.dto.ItemSalesSummaryDTO> categoryItems = tempGroupedStats.get(category);

                com.dattebayo.pos.dto.ItemSalesSummaryDTO summary = categoryItems.getOrDefault(itemName, 
                    new com.dattebayo.pos.dto.ItemSalesSummaryDTO(itemName, 0L, 0.0));
                
                long qty = item.getQuantity() != null ? item.getQuantity() : 0;
                double price = item.getPrice() != null ? item.getPrice() : 0.0;
                
                summary.setQuantity(summary.getQuantity() + qty);
                summary.setTotal(summary.getTotal() + (price * qty));
                
                categoryItems.put(itemName, summary);
            }
        }

        // Convert to final map
        Map<String, List<com.dattebayo.pos.dto.ItemSalesSummaryDTO>> salesByCategory = new java.util.HashMap<>();
        for (Map.Entry<String, Map<String, com.dattebayo.pos.dto.ItemSalesSummaryDTO>> entry : tempGroupedStats.entrySet()) {
            List<com.dattebayo.pos.dto.ItemSalesSummaryDTO> items = new java.util.ArrayList<>(entry.getValue().values());
            items.sort((a, b) -> Long.compare(b.getQuantity(), a.getQuantity())); // Sort by quantity desc
            salesByCategory.put(entry.getKey(), items);
        }
        return salesByCategory;
    }
}
