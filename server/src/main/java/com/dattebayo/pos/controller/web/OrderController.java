package com.dattebayo.pos.controller.web;

import com.dattebayo.pos.dto.CreateOrderDTO;
import com.dattebayo.pos.dto.OrderDTO;
import com.dattebayo.pos.dto.MenuItemDTO;
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
        // Get active orders (not completed/paid)
        List<OrderDTO> activeOrders = orderService.getAllOrders().stream()
                .filter(order -> order.getStatus() != Order.OrderStatus.COMPLETED)
                .toList();
        model.addAttribute("activeOrders", activeOrders);
        return "order";
    }
    
    @GetMapping("/new-order")
    public String newOrderPage(Model model) {
        List<MenuItemDTO> menuItems = menuItemService.getAvailableMenuItems();
        List<String> categories = menuItemService.getAllCategories();
        model.addAttribute("menuItems", menuItems);
        model.addAttribute("categories", categories);
        return "new-order";
    }

    @GetMapping("/menu-management")
    public String menuManagementPage(Model model) {
        List<MenuItemDTO> menuItems = menuItemService.getAllMenuItems();
        List<String> categories = menuItemService.getAllCategories();
        model.addAttribute("menuItems", menuItems);
        model.addAttribute("categories", categories);
        return "menu-management";
    }
    
    @GetMapping("/kitchen")
    public String kitchenPage(Model model) {
        List<OrderDTO> kitchenOrders = orderService.getKitchenOrders();
        model.addAttribute("orders", kitchenOrders);
        return "kitchen";
    }
    
    @GetMapping("/orders/{id}/edit")
    public String editOrderPage(@PathVariable Long id, Model model) {
        OrderDTO order = orderService.getOrderById(id);
        List<MenuItemDTO> menuItems = menuItemService.getAvailableMenuItems();
        List<String> categories = menuItemService.getAllCategories();
        
        model.addAttribute("order", order);
        model.addAttribute("menuItems", menuItems);
        model.addAttribute("categories", categories);
        return "edit-order";
    }

    @GetMapping("/orders/{id}/checkout")
    public String checkoutPage(@PathVariable Long id, Model model) {
        OrderDTO order = orderService.getOrderById(id);
        model.addAttribute("order", order);
        return "checkout";
    }
    
    @PostMapping("/orders")
    public String createOrder(@ModelAttribute CreateOrderDTO createOrderDTO) {
        orderService.createOrder(createOrderDTO);
        return "redirect:/new-order?success=true";
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
    
    @PostMapping("/orders/{id}/update")
    public String updateOrder(@PathVariable Long id, @ModelAttribute CreateOrderDTO createOrderDTO) {
        try {
            orderService.updateOrder(id, createOrderDTO);
        } catch (Exception e) {
            // Handle error
        }
        return "redirect:/?updated=true";
    }
}
