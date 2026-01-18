package com.dattebayo.pos.service;

import com.dattebayo.pos.dto.*;
import com.dattebayo.pos.model.*;
import com.dattebayo.pos.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
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
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(menuItem.getPrice());
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());
            
            // Handle variations
            if (itemRequest.getVariations() != null) {
                for (var variationRequest : itemRequest.getVariations()) {
                    MenuItemVariation variation = menuItemVariationRepository.findById(variationRequest.getMenuItemVariationId())
                            .orElseThrow(() -> new RuntimeException("Menu item variation not found: " + variationRequest.getMenuItemVariationId()));
                    
                    // Validate that the variation belongs to the menu item
                    if (!variation.getMenuItem().getId().equals(menuItem.getId())) {
                        throw new RuntimeException("Variation does not belong to the selected menu item");
                    }
                    
                    OrderItemVariation orderItemVariation = new OrderItemVariation();
                    orderItemVariation.setOrderItem(orderItem);
                    orderItemVariation.setMenuItemVariation(variation);
                    orderItemVariation.setSelected(variationRequest.getSelected());
                    
                    orderItem.getVariations().add(orderItemVariation);
                    
                    // Add additional price if variation is selected
                    if (variationRequest.getSelected()) {
                        orderItem.setPrice(orderItem.getPrice() + variation.getAdditionalPrice());
                    }
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
                Order.OrderStatus.PREPARING
        );
        return orderRepository.findByStatusInOrderByCreatedAtAsc(kitchenStatuses).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public OrderDTO updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        
        order.setStatus(newStatus);
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
            itemDTO.setMenuItemName(item.getMenuItem().getName());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            itemDTO.setSpecialInstructions(item.getSpecialInstructions());
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
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(menuItem.getPrice());
            orderItem.setSpecialInstructions(itemRequest.getSpecialInstructions());
            
            // Handle variations
            if (itemRequest.getVariations() != null) {
                for (var variationRequest : itemRequest.getVariations()) {
                    if (variationRequest.getSelected()) {
                        MenuItemVariation variation = menuItemVariationRepository.findById(variationRequest.getMenuItemVariationId())
                                .orElseThrow(() -> new RuntimeException("Variation not found: " + variationRequest.getMenuItemVariationId()));
                        
                        OrderItemVariation orderItemVariation = new OrderItemVariation();
                        orderItemVariation.setOrderItem(orderItem);
                        orderItemVariation.setMenuItemVariation(variation);
                        orderItemVariation.setSelected(true);
                        
                        orderItem.getVariations().add(orderItemVariation);
                        orderItem.setPrice(orderItem.getPrice() + variation.getAdditionalPrice());
                    }
                }
            }
            
            order.getItems().add(orderItem);
        }
        
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        
        return convertToDTO(savedOrder);
    }
}
