package com.dattebayo.pos.config;

import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.model.MenuItemVariation;
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
            MenuItem springRolls = new MenuItem();
            springRolls.setName("Spring Rolls");
            springRolls.setDescription("Crispy vegetable spring rolls with sweet chili sauce");
            springRolls.setPrice(8.99);
            springRolls.setCategory("Appetizers");
            springRolls.setAvailable(true);
            springRolls.getVariations().add(new MenuItemVariation(null, "With Shrimp", "SINGLE", 2.00, 0, springRolls));
            menuItemRepository.save(springRolls);
            
            MenuItem chickenWings = new MenuItem();
            chickenWings.setName("Chicken Wings");
            chickenWings.setDescription("Spicy buffalo wings with blue cheese dip");
            chickenWings.setPrice(12.99);
            chickenWings.setCategory("Appetizers");
            chickenWings.setAvailable(true);
            menuItemRepository.save(chickenWings);
            
            MenuItem caesarSalad = new MenuItem();
            caesarSalad.setName("Caesar Salad");
            caesarSalad.setDescription("Fresh romaine lettuce with caesar dressing");
            caesarSalad.setPrice(9.99);
            caesarSalad.setCategory("Appetizers");
            caesarSalad.setAvailable(true);
            menuItemRepository.save(caesarSalad);
            
            // Main Courses
            MenuItem grilledChicken = new MenuItem();
            grilledChicken.setName("Grilled Chicken");
            grilledChicken.setDescription("Herb-marinated grilled chicken breast with vegetables");
            grilledChicken.setPrice(18.99);
            grilledChicken.setCategory("Main Courses");
            grilledChicken.setAvailable(true);
            menuItemRepository.save(grilledChicken);
            
            MenuItem beefSteak = new MenuItem();
            beefSteak.setName("Beef Steak");
            beefSteak.setDescription("Tender beef steak with mashed potatoes");
            beefSteak.setPrice(24.99);
            beefSteak.setCategory("Main Courses");
            beefSteak.setAvailable(true);
            menuItemRepository.save(beefSteak);
            
            MenuItem salmonFillet = new MenuItem();
            salmonFillet.setName("Salmon Fillet");
            salmonFillet.setDescription("Pan-seared salmon with rice and vegetables");
            salmonFillet.setPrice(22.99);
            salmonFillet.setCategory("Main Courses");
            salmonFillet.setAvailable(true);
            menuItemRepository.save(salmonFillet);
            
            MenuItem pastaCarbonara = new MenuItem();
            pastaCarbonara.setName("Pasta Carbonara");
            pastaCarbonara.setDescription("Creamy pasta with bacon and parmesan");
            pastaCarbonara.setPrice(16.99);
            pastaCarbonara.setCategory("Main Courses");
            pastaCarbonara.setAvailable(true);
            menuItemRepository.save(pastaCarbonara);
            
            // Brazilian Food - Pastel with multiple fillings
            MenuItem pastel = new MenuItem();
            pastel.setName("Pastel");
            pastel.setDescription("Brazilian fried pastry");
            pastel.setPrice(6.99);
            pastel.setCategory("Brazilian");
            pastel.setAvailable(true);
            // Importance levels: higher = more important (becomes base price)
            pastel.getVariations().add(new MenuItemVariation(null, "Meat", "MULTIPLE", 0.00, 3, pastel));
            pastel.getVariations().add(new MenuItemVariation(null, "Chicken", "MULTIPLE", 0.00, 2, pastel));
            pastel.getVariations().add(new MenuItemVariation(null, "Cheese", "MULTIPLE", 0.00, 1, pastel));
            menuItemRepository.save(pastel);
            
            // Tempura with shrimp option
            MenuItem tempura = new MenuItem();
            tempura.setName("Tempura");
            tempura.setDescription("Japanese deep-fried battered vegetables");
            tempura.setPrice(12.99);
            tempura.setCategory("Japanese");
            tempura.setAvailable(true);
            tempura.getVariations().add(new MenuItemVariation(null, "With Shrimp", "SINGLE", 2.00, 0, tempura));
            menuItemRepository.save(tempura);
            
            // Beverages
            MenuItem cocaCola = new MenuItem();
            cocaCola.setName("Coca Cola");
            cocaCola.setDescription("Cold soft drink");
            cocaCola.setPrice(3.99);
            cocaCola.setCategory("Beverages");
            cocaCola.setAvailable(true);
            menuItemRepository.save(cocaCola);
            
            MenuItem orangeJuice = new MenuItem();
            orangeJuice.setName("Orange Juice");
            orangeJuice.setDescription("Fresh squeezed orange juice");
            orangeJuice.setPrice(4.99);
            orangeJuice.setCategory("Beverages");
            orangeJuice.setAvailable(true);
            menuItemRepository.save(orangeJuice);
            
            MenuItem coffee = new MenuItem();
            coffee.setName("Coffee");
            coffee.setDescription("Hot brewed coffee");
            coffee.setPrice(3.49);
            coffee.setCategory("Beverages");
            coffee.setAvailable(true);
            menuItemRepository.save(coffee);
            
            // Desserts
            MenuItem chocolateCake = new MenuItem();
            chocolateCake.setName("Chocolate Cake");
            chocolateCake.setDescription("Rich chocolate layer cake");
            chocolateCake.setPrice(7.99);
            chocolateCake.setCategory("Desserts");
            chocolateCake.setAvailable(true);
            menuItemRepository.save(chocolateCake);
            
            MenuItem iceCream = new MenuItem();
            iceCream.setName("Ice Cream");
            iceCream.setDescription("Vanilla ice cream with toppings");
            iceCream.setPrice(5.99);
            iceCream.setCategory("Desserts");
            iceCream.setAvailable(true);
            menuItemRepository.save(iceCream);
        }
    }
}
