package com.dattebayo.pos.controller.web;

import com.dattebayo.pos.dto.CreateOrderDTO;
import com.dattebayo.pos.dto.OrderDTO;
import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.model.Order;
import com.dattebayo.pos.service.MenuItemService;
import com.dattebayo.pos.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RequestMapping("/")
public class OrderController {
    
    @Autowired
    private MenuItemService menuItemService;
    
    @Autowired
    private OrderService orderService;
    
    @GetMapping
    public String orderPage(Model model) {
        List<MenuItem> menuItems = menuItemService.getAvailableMenuItems();
        List<String> categories = menuItemService.getAllCategories();
        // Get active orders (not completed/paid)
        List<OrderDTO> activeOrders = orderService.getAllOrders().stream()
                .filter(order -> order.getStatus() != Order.OrderStatus.COMPLETED)
                .toList();
        model.addAttribute("menuItems", menuItems);
        model.addAttribute("categories", categories);
        model.addAttribute("activeOrders", activeOrders);
        return "order";
    }
    
    @GetMapping("/kitchen")
    public String kitchenDisplay(Model model) {
        List<OrderDTO> kitchenOrders = orderService.getKitchenOrders();
        model.addAttribute("orders", kitchenOrders);
        return "kitchen";
    }
    
    @PostMapping("/orders")
    public String createOrder(@ModelAttribute CreateOrderDTO createOrderDTO) {
        orderService.createOrder(createOrderDTO);
        return "redirect:/?success=true";
    }
    
    @PostMapping("/orders/{id}/status")
    public String updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            orderService.updateOrderStatus(id, orderStatus);
        } catch (Exception e) {
            // Handle error
        }
        return "redirect:/kitchen";
    }
    
    @PostMapping("/orders/{id}/mark-paid")
    public String markOrderAsPaid(@PathVariable Long id) {
        try {
            orderService.updateOrderStatus(id, Order.OrderStatus.COMPLETED);
        } catch (Exception e) {
            // Handle error
        }
        return "redirect:/?paid=true";
    }
}
