package com.dattebayo.pos.config;

import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.model.MenuItemVariation;
import com.dattebayo.pos.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    
    @Override
    @Transactional
    public void run(String... args) {
            migrateDatabase();
            if (menuItemRepository.count() == 0) {
                seedInitialData();
            } else {
                ensureVariationsSeeded();
            }
    }

    private void migrateDatabase() {
        try {
            System.out.println("Starting database migration...");
            jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
            jdbcTemplate.execute("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'))");
            System.out.println("Database migration completed: Updated orders_status_check constraint.");
        } catch (Exception e) {
            System.err.println("Database migration warning: " + e.getMessage());
        }
    }

    private void seedInitialData() {
                // Comidas
                MenuItem pastel = new MenuItem();
                pastel.setName("Pastel");
                pastel.setDescription("Pastel de vento com diferentes recheios");
                pastel.setPrice(6.00);
                pastel.setCategory("Comidas");
                pastel.setAvailable(true);
                pastel.getVariations().add(new MenuItemVariation(null, "Queijo", "MULTIPLE", 2.00, 0, pastel));
                pastel.getVariations().add(new MenuItemVariation(null, "Frango", "MULTIPLE", 2.00, 0, pastel));
                pastel.getVariations().add(new MenuItemVariation(null, "Carne", "MULTIPLE", 2.00, 0, pastel));
                pastel.getVariations().add(new MenuItemVariation(null, "Calabresa", "MULTIPLE", 2.00, 0, pastel));
                pastel.getVariations().add(new MenuItemVariation(null, "Catupiry", "MULTIPLE", 2.00, 0, pastel));
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
                tempura.getVariations().add(new MenuItemVariation(null, "Com Camarão", "SINGLE", 2.00, 0, tempura));
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
                yakisoba.getVariations().add(new MenuItemVariation(null, "Com Camarão", "SINGLE", 5.00, 0, yakisoba));
                menuItemRepository.save(yakisoba);

                // Hot sushi Com Camarão option
                MenuItem hotSushi = new MenuItem();
                hotSushi.setName("Hot Sushi");
                hotSushi.setDescription("Hot Sushi de salmão ou camarão");
                hotSushi.setPrice(35.00);
                hotSushi.setCategory("Comidas");
                hotSushi.setAvailable(true);
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Salmão", "MULTIPLE", 0.00, 0, hotSushi));
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Camarão", "MULTIPLE", 0.00, 0, hotSushi));
                menuItemRepository.save(hotSushi);

                // Mini hot temaki com Camarão option
                MenuItem hotTemaki = new MenuItem();
                hotTemaki.setName("Hot Temaki");
                hotTemaki.setDescription("Hot Temaki de salmão ou camarão");
                hotTemaki.setPrice(20.00);
                hotTemaki.setCategory("Comidas");
                hotTemaki.setAvailable(true);
                hotTemaki.getVariations().add(new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, 0, hotTemaki));
                hotTemaki.getVariations().add(new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, 0, hotTemaki));
                menuItemRepository.save(hotTemaki);

                // Hot ball com Camarão option
                MenuItem hotBall = new MenuItem();
                hotBall.setName("Hot Ball");
                hotBall.setDescription("Bolinho de sushi (salmão ou camarão) com queijo empanado e frito");
                hotBall.setPrice(12.00);
                hotBall.setCategory("Comidas");
                hotBall.setAvailable(true);
                hotBall.getVariations().add(new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, 0, hotBall));
                hotBall.getVariations().add(new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, 0, hotBall));
                menuItemRepository.save(hotBall);

                // Hot coreano com Camarão option
                MenuItem hotCoreano = new MenuItem();
                hotCoreano.setName("Hot Coreano");
                hotCoreano.setDescription("Espeto de salmão ou camarão com queijo empanado com massa estilo coreano");
                hotCoreano.setPrice(20.00);
                hotCoreano.setCategory("Comidas");
                hotCoreano.setAvailable(true);
                hotCoreano.getVariations().add(new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, 0, hotCoreano));
                hotCoreano.getVariations().add(new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, 0, hotCoreano));
                menuItemRepository.save(hotCoreano);

                // Gyoza
                MenuItem gyoza = new MenuItem();
                gyoza.setName("Gyoza");
                gyoza.setDescription("Gyoza de carne bovina com legumes");
                gyoza.setPrice(17.00);
                gyoza.setCategory("Comidas");
                gyoza.setAvailable(true);
                menuItemRepository.save(gyoza);

                // Polvo no espeto
                MenuItem polvoNoEspeto = new MenuItem();
                polvoNoEspeto.setName("Polvo no Espeto");
                polvoNoEspeto.setDescription("Polvo no espeto frito na chapa acompanhado de arroz");
                polvoNoEspeto.setPrice(20.00);
                polvoNoEspeto.setCategory("Comidas");
                polvoNoEspeto.setAvailable(true);
                menuItemRepository.save(polvoNoEspeto);

                // Camarão Milanesa
                MenuItem camaraoMilanesa = new MenuItem();
                camaraoMilanesa.setName("Camarão Milanesa");
                camaraoMilanesa.setDescription("Camarão rosa empanado e frito");
                camaraoMilanesa.setPrice(0.00);
                camaraoMilanesa.setCategory("Comidas");
                camaraoMilanesa.setAvailable(true);
                camaraoMilanesa.getVariations().add(new MenuItemVariation(null, "Unidade", "SINGLE", 6.00, 0, camaraoMilanesa));
                camaraoMilanesa.getVariations().add(new MenuItemVariation(null, "Porção com 5 unidades", "SINGLE", 25.00, 0, camaraoMilanesa));
                menuItemRepository.save(camaraoMilanesa);

                // Bubble
                MenuItem bubble = new MenuItem();
                bubble.setName("Bubble");
                bubble.setDescription("Suco com bolinhas saborizadas (300 ml)");
                bubble.setPrice(15.00);
                bubble.setCategory("Bebidas");
                bubble.setAvailable(true);
                menuItemRepository.save(bubble);
    }

    private void ensureVariationsSeeded() {
        checkAndSeedVariations("Pastel", java.util.List.of(
            new MenuItemVariation(null, "Queijo", "MULTIPLE", 2.00, 0, null),
            new MenuItemVariation(null, "Frango", "MULTIPLE", 2.00, 0, null),
            new MenuItemVariation(null, "Carne", "MULTIPLE", 2.00, 0, null),
            new MenuItemVariation(null, "Calabresa", "MULTIPLE", 2.00, 0, null),
            new MenuItemVariation(null, "Catupiry", "MULTIPLE", 2.00, 0, null)
        ));

        checkAndSeedVariations("Tempurá", java.util.List.of(
            new MenuItemVariation(null, "Com Camarão", "SINGLE", 2.00, 0, null)
        ));

        checkAndSeedVariations("Yakisoba", java.util.List.of(
            new MenuItemVariation(null, "Com Camarão", "SINGLE", 5.00, 0, null)
        ));
        
        checkAndSeedVariations("Hot Sushi", java.util.List.of(
            new MenuItemVariation(null, "De Salmão", "MULTIPLE", 0.00, 0, null),
            new MenuItemVariation(null, "De Camarão", "MULTIPLE", 0.00, 0, null)
        ));

        checkAndSeedVariations("Hot Temaki", java.util.List.of(
            new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, 0, null),
            new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, 0, null)
        ));

        checkAndSeedVariations("Hot Ball", java.util.List.of(
            new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, 0, null),
            new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, 0, null)
        ));
        
        checkAndSeedVariations("Hot Coreano", java.util.List.of(
            new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, 0, null),
            new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, 0, null)
        ));
        
        checkAndSeedVariations("Camarão Milanesa", java.util.List.of(
            new MenuItemVariation(null, "Unidade", "SINGLE", 6.00, 0, null),
            new MenuItemVariation(null, "Porção com 5 unidades", "SINGLE", 25.00, 0, null)
        ));
    }

    private void checkAndSeedVariations(String itemName, java.util.List<MenuItemVariation> expectedVariations) {
        menuItemRepository.findByName(itemName).ifPresent(item -> {
            if (item.getVariations().isEmpty()) {
                System.out.println("Seeding variations for " + itemName);
                for (MenuItemVariation v : expectedVariations) {
                    v.setMenuItem(item);
                    item.getVariations().add(v);
                }
                menuItemRepository.save(item);
            }
        });
    }
}
