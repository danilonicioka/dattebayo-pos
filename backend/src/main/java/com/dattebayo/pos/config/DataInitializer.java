package com.dattebayo.pos.config;

import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    @Override
    public void run(String... args) {
        if (menuItemRepository.count() == 0) {
            // Appetizers
            menuItemRepository.save(new MenuItem(null, "Spring Rolls", "Crispy vegetable spring rolls with sweet chili sauce", 8.99, "Appetizers", true));
            menuItemRepository.save(new MenuItem(null, "Chicken Wings", "Spicy buffalo wings with blue cheese dip", 12.99, "Appetizers", true));
            menuItemRepository.save(new MenuItem(null, "Caesar Salad", "Fresh romaine lettuce with caesar dressing", 9.99, "Appetizers", true));
            
            // Main Courses
            menuItemRepository.save(new MenuItem(null, "Grilled Chicken", "Herb-marinated grilled chicken breast with vegetables", 18.99, "Main Courses", true));
            menuItemRepository.save(new MenuItem(null, "Beef Steak", "Tender beef steak with mashed potatoes", 24.99, "Main Courses", true));
            menuItemRepository.save(new MenuItem(null, "Salmon Fillet", "Pan-seared salmon with rice and vegetables", 22.99, "Main Courses", true));
            menuItemRepository.save(new MenuItem(null, "Pasta Carbonara", "Creamy pasta with bacon and parmesan", 16.99, "Main Courses", true));
            
            // Beverages
            menuItemRepository.save(new MenuItem(null, "Coca Cola", "Cold soft drink", 3.99, "Beverages", true));
            menuItemRepository.save(new MenuItem(null, "Orange Juice", "Fresh squeezed orange juice", 4.99, "Beverages", true));
            menuItemRepository.save(new MenuItem(null, "Coffee", "Hot brewed coffee", 3.49, "Beverages", true));
            
            // Desserts
            menuItemRepository.save(new MenuItem(null, "Chocolate Cake", "Rich chocolate layer cake", 7.99, "Desserts", true));
            menuItemRepository.save(new MenuItem(null, "Ice Cream", "Vanilla ice cream with toppings", 5.99, "Desserts", true));
        }
    }
}
