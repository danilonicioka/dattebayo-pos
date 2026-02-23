package com.dattebayo.pos.service;

import com.dattebayo.pos.dto.OrderDTO;
import com.dattebayo.pos.model.*;
import com.dattebayo.pos.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    
    // Mocks for unused dependencies to allow injection
    @Mock
    private com.dattebayo.pos.repository.MenuItemRepository menuItemRepository;
    @Mock
    private com.dattebayo.pos.repository.MenuItemVariationRepository menuItemVariationRepository;
    @Mock
    private com.dattebayo.pos.repository.OrderItemVariationRepository orderItemVariationRepository;
    @Mock
    private ConfigurationService configurationService;

    @InjectMocks
    private OrderService orderService;

    @Test
    public void testGetOrderById_TempuraWithShrimp() {
        // Arrange
        Long orderId = 1L;
        Order order = new Order();
        order.setId(orderId);
        order.setItems(new ArrayList<>());
        
        MenuItem tempura = new MenuItem();
        tempura.setName("Tempurá");
        tempura.setCategory("Comidas");
        tempura.setPrice(10.0);
        
        OrderItem orderItem = new OrderItem();
        orderItem.setId(1L);
        orderItem.setOrder(order);
        orderItem.setMenuItem(tempura);
        orderItem.setQuantity(1);
        orderItem.setPrice(12.0); // 10 + 2
        orderItem.setVariations(new ArrayList<>());
        
        MenuItemVariation shrimpVar = new MenuItemVariation();
        shrimpVar.setName("Com Camarão"); // Exact match with DataInitializer
        shrimpVar.setType("SINGLE");
        shrimpVar.setAdditionalPrice(2.0);
        shrimpVar.setMenuItem(tempura); // Link back for completeness
        
        OrderItemVariation orderItemVar = new OrderItemVariation();
        orderItemVar.setOrderItem(orderItem);
        orderItemVar.setMenuItemVariation(shrimpVar);
        orderItemVar.setSelected(true);
        orderItemVar.setQuantity(1);
        
        orderItem.getVariations().add(orderItemVar);
        order.getItems().add(orderItem);
        
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        
        // Act
        OrderDTO result = orderService.getOrderById(orderId);
        
        // Assert
        assertEquals(1, result.getItems().size());
        
        // This assertion verifies if the logic correctly identifies the variation
        // If bug exists (e.g. slight mismatch), it might fail or pass depending on reproduction quality
        assertEquals("Tempurá Com Camarão", result.getItems().get(0).getMenuItemName());
    }
}
