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
        // First check if Pastel exists and has a "Paraense" variation to remove
        menuItemRepository.findAll().stream()
            .filter(item -> "Pastel".equals(item.getName()))
            .findFirst()
            .ifPresent(pastel -> {
                boolean removed = pastel.getVariations().removeIf(v -> "Paraense".equals(v.getName()));
                if (removed) {
                    menuItemRepository.save(pastel);
                }
            });

        // Current initialization logic
        if (menuItemRepository.count() == 0 || !menuItemRepository.findAll().stream().anyMatch(i -> "Pastel Paraense".equals(i.getName()))) {
            if (menuItemRepository.count() == 0) {
                // Comidas
                MenuItem pastel = new MenuItem();
                pastel.setName("Pastel");
                pastel.setDescription("Pastel de vento com diferentes recheios");
                pastel.setPrice(6.00);
                pastel.setCategory("Comidas");
                pastel.setAvailable(true);
                pastel.getVariations().add(new MenuItemVariation(null, "Queijo", "MULTIPLE", 2.00, pastel));
                pastel.getVariations().add(new MenuItemVariation(null, "Frango", "MULTIPLE", 2.00, pastel));
                pastel.getVariations().add(new MenuItemVariation(null, "Carne", "MULTIPLE", 2.00, pastel));
                pastel.getVariations().add(new MenuItemVariation(null, "Calabresa", "MULTIPLE", 2.00, pastel));
                pastel.getVariations().add(new MenuItemVariation(null, "Catupiry", "MULTIPLE", 2.00, pastel));
                menuItemRepository.save(pastel);
                
                MenuItem tempura = new MenuItem();
                tempura.setName("Tempurá");
                tempura.setDescription("Tempura de legumes com ou sem camarão");
                tempura.setPrice(10.00);
                tempura.setCategory("Comidas");
                tempura.setAvailable(true);
                tempura.getVariations().add(new MenuItemVariation(null, "Com Camarão", "SINGLE", 2.00, tempura));
                menuItemRepository.save(tempura);
                
                MenuItem takoyaki = new MenuItem();
                takoyaki.setName("Takoyaki");
                takoyaki.setDescription("Bolinho de com recheio de polvo");
                takoyaki.setPrice(20.00);
                takoyaki.setCategory("Comidas");
                takoyaki.setAvailable(true);
                menuItemRepository.save(takoyaki);

                MenuItem yakisoba = new MenuItem();
                yakisoba.setName("Yakisoba");
                yakisoba.setDescription("Yakisoba de carne e frango com ou sem camarão");
                yakisoba.setPrice(20.00);
                yakisoba.setCategory("Comidas");
                yakisoba.setAvailable(true);
                yakisoba.getVariations().add(new MenuItemVariation(null, "Com Camarão", "SINGLE", 5.00, yakisoba));
                menuItemRepository.save(yakisoba);

                MenuItem hotSushi = new MenuItem();
                hotSushi.setName("Hot Sushi");
                hotSushi.setDescription("Hot Sushi de salmão ou camarão");
                hotSushi.setPrice(30.00);
                hotSushi.setCategory("Comidas");
                hotSushi.setAvailable(true);
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Salmão", "MULTIPLE", 0.00, hotSushi));
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Camarão", "MULTIPLE", 0.00, hotSushi));
                menuItemRepository.save(hotSushi);
            }

            // Ensure Pastel Paraense exists
            if (!menuItemRepository.findAll().stream().anyMatch(i -> "Pastel Paraense".equals(i.getName()))) {
                MenuItem pastelParaense = new MenuItem();
                pastelParaense.setName("Pastel Paraense");
                pastelParaense.setDescription("Pastel com camarão, jambu, queijo e catupiry");
                pastelParaense.setPrice(14.00);
                pastelParaense.setCategory("Comidas");
                pastelParaense.setAvailable(true);
                menuItemRepository.save(pastelParaense);
            }
        }
    }
}
