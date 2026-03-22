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
import java.util.Map;

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
                .filter(order -> order.getStatus() != Order.OrderStatus.COMPLETED && order.getStatus() != Order.OrderStatus.CANCELLED)
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

    @GetMapping("/history")
    public String historyPage(Model model) {
        List<OrderDTO> completedOrders = orderService.getHistoryOrders();
        model.addAttribute("orders", completedOrders);
        return "history";
    }

    @GetMapping("/stock-management")
    public String stockManagementPage(Model model) {
        List<MenuItemDTO> menuItems = menuItemService.getAllMenuItems();
        List<String> categories = menuItemService.getAllCategories();
        model.addAttribute("menuItems", menuItems);
        model.addAttribute("categories", categories);
        return "stock-management";
    }

    @GetMapping("/sales-summary")
    public String salesSummaryPage(Model model) {
        List<OrderDTO> completedOrders = orderService.getCompletedOrders();

        // Calculate Total Revenue
        double totalRevenue = completedOrders.stream()
                .filter(o -> o.getTotal() != null)
                .mapToDouble(o -> o.getTotal())
                .sum();

        // Calculate Total Items Sold
        long totalItemsSold = completedOrders.stream()
                .filter(o -> o.getItems() != null)
                .flatMap(order -> order.getItems().stream())
                .mapToLong(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();

        // Get Summary Map from Service
        Map<String, List<com.dattebayo.pos.dto.ItemSalesSummaryDTO>> salesByCategory = 
            orderService.getSalesSummaryByCategory(completedOrders, menuItemService.getAllMenuItems());

        model.addAttribute("totalRevenue", totalRevenue);
        model.addAttribute("totalItemsSold", totalItemsSold);
        model.addAttribute("salesByCategory", salesByCategory);
        return "sales-summary";
    }

    @PostMapping("/history/clear")
    public String clearHistory() {
        orderService.clearOrderHistory();
        return "redirect:/history?cleared=true";
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
    
    @PostMapping("/orders/{id}/cancel")
    public String cancelOrder(@PathVariable Long id) {
        try {
            orderService.cancelOrder(id);
        } catch (Exception e) {
            // Handle error
        }
        return "redirect:/?cancelled=true";
    }

    @PostMapping("/orders/conclude-all")
    public String concludeAllOrders() {
        try {
            orderService.concludeAllActiveOrders();
        } catch (Exception e) {
            // Handle error
        }
        return "redirect:/?bulkPaid=true";
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
