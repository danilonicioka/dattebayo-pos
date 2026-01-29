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
                
                MenuItem pastelParaense = new MenuItem();
                pastelParaense.setName("Pastel Paraense");
                pastelParaense.setDescription("Pastel com camarão, jambu, queijo e catupiry");
                pastelParaense.setPrice(15.00);
                pastelParaense.setCategory("Comidas");
                pastelParaense.setAvailable(true);
                menuItemRepository.save(pastelParaense);
            
                // Tempura Com Camarão option
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
                takoyaki.setPrice(23.00);
                takoyaki.setCategory("Comidas");
                takoyaki.setAvailable(true);
                menuItemRepository.save(takoyaki);

                // Yakisoba Com Camarão option
                MenuItem yakisoba = new MenuItem();
                yakisoba.setName("Yakisoba");
                yakisoba.setDescription("Yakisoba de carne e frango com ou sem camarão");
                yakisoba.setPrice(22.00);
                yakisoba.setCategory("Comidas");
                yakisoba.setAvailable(true);
                yakisoba.getVariations().add(new MenuItemVariation(null, "Com Camarão", "SINGLE", 5.00, yakisoba));
                menuItemRepository.save(yakisoba);

                // Hot sushi Com Camarão option
                MenuItem hotSushi = new MenuItem();
                hotSushi.setName("Hot Sushi");
                hotSushi.setDescription("Hot Sushi de salmão ou camarão");
                hotSushi.setPrice(35.00);
                hotSushi.setCategory("Comidas");
                hotSushi.setAvailable(true);
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Salmão", "MULTIPLE", 0.00, hotSushi));
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Camarão", "MULTIPLE", 0.00, hotSushi));
                menuItemRepository.save(hotSushi);

                // Mini hot temaki com Camarão option
                MenuItem hotTemaki = new MenuItem();
                hotTemaki.setName("Hot Temaki");
                hotTemaki.setDescription("Hot Temaki de salmão ou camarão");
                hotTemaki.setPrice(20.00);
                hotTemaki.setCategory("Comidas");
                hotTemaki.setAvailable(true);
                hotTemaki.getVariations().add(new MenuItemVariation(null, "De Salmão", "MULTIPLE", 0.00, hotTemaki));
                hotTemaki.getVariations().add(new MenuItemVariation(null, "De Camarão", "MULTIPLE", 0.00, hotTemaki));
                menuItemRepository.save(hotTemaki);

                // Gyoza
                MenuItem gyoza = new MenuItem();
                gyoza.setName("Gyoza");
                gyoza.setDescription("Gyoza de carne bovina com legumes");
                gyoza.setPrice(17.00);
                gyoza.setCategory("Comidas");
                gyoza.setAvailable(true);
                menuItemRepository.save(gyoza);

                // Camarão Milanesa
                MenuItem camaraoMilanesa = new MenuItem();
                camaraoMilanesa.setName("Camarão Milanesa");
                camaraoMilanesa.setDescription("Camarão rosa empanado e frito");
                camaraoMilanesa.setPrice(0.00);
                camaraoMilanesa.setCategory("Comidas");
                camaraoMilanesa.setAvailable(true);
                camaraoMilanesa.getVariations().add(new MenuItemVariation(null, "Unidade", "MULTIPLE", 6.00, camaraoMilanesa));
                camaraoMilanesa.getVariations().add(new MenuItemVariation(null, "Porção com 5 unidades", "MULTIPLE", 25.00, camaraoMilanesa));
                menuItemRepository.save(camaraoMilanesa);

                // Bubble
                MenuItem bubble = new MenuItem();
                bubble.setName("Bubble");
                bubble.setDescription("Suco com bolinha saborizadas");
                bubble.setPrice(15.00);
                bubble.setCategory("Bebidas");
                bubble.setAvailable(true);
                menuItemRepository.save(bubble);
            }
    }
}
