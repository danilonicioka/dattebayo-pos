package com.dattebayo.pos.config;

import com.dattebayo.pos.model.Combo;
import com.dattebayo.pos.model.ComboItem;
import com.dattebayo.pos.model.MenuItem;
import com.dattebayo.pos.model.MenuItemVariation;
import com.dattebayo.pos.repository.ComboRepository;
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
    private ComboRepository comboRepository;

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
                // Tempura Variations
                MenuItem tempura = new MenuItem();
                tempura.setName("Tempurá");
                tempura.setDescription("Tempurá crocante com opções de legumes ou camarão");
                tempura.setPrice(10.00);
                tempura.setCategory("Comidas");
                tempura.setAvailable(true);
                tempura.getVariations().add(new MenuItemVariation(null, "De Legumes", "SINGLE", 0.00, null, 1, tempura));
                tempura.getVariations().add(new MenuItemVariation(null, "Com Camarão", "SINGLE", 2.00, null, 1, tempura));
                menuItemRepository.save(tempura);

                MenuItem takoyaki = new MenuItem();
                takoyaki.setName("Takoyaki");
                takoyaki.setDescription("Bolinho de com recheio de polvo");
                takoyaki.setPrice(23.00);
                takoyaki.setCategory("Comidas");
                takoyaki.setAvailable(true);
                menuItemRepository.save(takoyaki);

                // Mini hot temaki com Camarão option
                MenuItem temaki = new MenuItem();
                temaki.setName("Temaki");
                temaki.setDescription("Temaki de salmão ou camarão");
                temaki.setPrice(22.00);
                temaki.setCategory("Comidas");
                temaki.setAvailable(true);
                temaki.getVariations().add(new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, null, 1, temaki));
                temaki.getVariations().add(new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, null, 1, temaki));
                menuItemRepository.save(temaki);

                // Gyoza
                MenuItem gyoza = new MenuItem();
                gyoza.setName("Gyoza");
                gyoza.setDescription("Gyoza de carne bovina com legumes");
                gyoza.setPrice(18.00);
                gyoza.setCategory("Comidas");
                gyoza.setAvailable(true);
                gyoza.getVariations().add(new MenuItemVariation(null, "Unidade (Unid)", "SINGLE", 0.00, null, 1, gyoza));
                menuItemRepository.save(gyoza);

                // Hot ball com Camarão option
                MenuItem hotBall = new MenuItem();
                hotBall.setName("Hot Ball");
                hotBall.setDescription("Bolinho de sushi (salmão ou camarão) com queijo empanado e frito");
                hotBall.setPrice(12.00);
                hotBall.setCategory("Comidas");
                hotBall.setAvailable(true);
                hotBall.getVariations().add(new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, null, 1, hotBall));
                hotBall.getVariations().add(new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, null, 1, hotBall));
                menuItemRepository.save(hotBall);

                // Hot Coreano
                MenuItem hotCoreano = new MenuItem();
                hotCoreano.setName("Hot Coreano");
                hotCoreano.setDescription("Espeto de salsicha, salmão ou camarão com queijo empanado com massa estilo coreano");
                hotCoreano.setPrice(18.00);
                hotCoreano.setCategory("Comidas");
                hotCoreano.setAvailable(true);
                hotCoreano.getVariations().add(new MenuItemVariation(null, "De Salsicha", "SINGLE", 0.00, null, 1, hotCoreano));
                hotCoreano.getVariations().add(new MenuItemVariation(null, "De Salmão", "SINGLE", 2.00, null, 1, hotCoreano));
                hotCoreano.getVariations().add(new MenuItemVariation(null, "De Camarão", "SINGLE", 2.00, null, 1, hotCoreano));
                menuItemRepository.save(hotCoreano);

                // Mini Hot Coreano
                MenuItem miniHotCoreano = new MenuItem();
                miniHotCoreano.setName("Mini Hot Coreano");
                miniHotCoreano.setDescription("Mini espeto de salsicha, salmão ou camarão com queijo empanado com massa estilo coreano");
                miniHotCoreano.setPrice(12.00);
                miniHotCoreano.setCategory("Comidas");
                miniHotCoreano.setAvailable(true);
                miniHotCoreano.setComboOnly(true);
                miniHotCoreano.getVariations().add(new MenuItemVariation(null, "De Salsicha", "SINGLE", 0.00, null, 1, miniHotCoreano));
                miniHotCoreano.getVariations().add(new MenuItemVariation(null, "De Salmão", "SINGLE", 2.00, null, 1, miniHotCoreano));
                miniHotCoreano.getVariations().add(new MenuItemVariation(null, "De Camarão", "SINGLE", 2.00, null, 1, miniHotCoreano));
                menuItemRepository.save(miniHotCoreano);

                // Yakisoba Variations
                MenuItem yakisoba = new MenuItem();
                yakisoba.setName("Yakisoba");
                yakisoba.setDescription("Yakisoba tradicional de carne e frango com opção de camarão");
                yakisoba.setPrice(22.00);
                yakisoba.setCategory("Comidas");
                yakisoba.setAvailable(true);
                yakisoba.getVariations().add(new MenuItemVariation(null, "Simples", "SINGLE", 0.00, null, 1, yakisoba));
                yakisoba.getVariations().add(new MenuItemVariation(null, "Com Camarão", "SINGLE", 5.00, null, 1, yakisoba));
                menuItemRepository.save(yakisoba);

                // Hot sushi Com Camarão option
                MenuItem hotSushi = new MenuItem();
                hotSushi.setName("Hot Sushi");
                hotSushi.setDescription("Hot Sushi de salmão ou camarão");
                hotSushi.setPrice(35.00);
                hotSushi.setCategory("Comidas");
                hotSushi.setAvailable(true);
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Salmão", "MULTIPLE", 0.00, null, 1, hotSushi));
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Camarão", "MULTIPLE", 0.00, null, 1, hotSushi));
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Salmão (Unid)", "MULTIPLE", 0.00, null, 1, hotSushi));
                hotSushi.getVariations().add(new MenuItemVariation(null, "De Camarão (Unid)", "MULTIPLE", 0.00, null, 1, hotSushi));
                menuItemRepository.save(hotSushi);

                // MenuItem pastel = new MenuItem();
                // pastel.setName("Pastel");
                // pastel.setDescription("Pastel de vento com diferentes recheios");
                // pastel.setPrice(6.00);
                // pastel.setCategory("Comidas");
                // pastel.setAvailable(true);
                // pastel.getVariations().add(new MenuItemVariation(null, "Queijo", "MULTIPLE", 2.00, null, 1, pastel));
                // pastel.getVariations().add(new MenuItemVariation(null, "Frango", "MULTIPLE", 2.00, null, 1, pastel));
                // pastel.getVariations().add(new MenuItemVariation(null, "Carne", "MULTIPLE", 2.00, null, 1, pastel));
                // pastel.getVariations().add(new MenuItemVariation(null, "Calabresa", "MULTIPLE", 2.00, null, 1, pastel));
                // pastel.getVariations().add(new MenuItemVariation(null, "Catupiry", "MULTIPLE", 2.00, null, 1, pastel));
                // menuItemRepository.save(pastel);
                
                MenuItem pastelParaense = new MenuItem();
                pastelParaense.setName("Pastel Paraense");
                pastelParaense.setDescription("Pastel com camarão, jambu, queijo e catupiry");
                pastelParaense.setPrice(15.00);
                pastelParaense.setCategory("Comidas");
                pastelParaense.setAvailable(true);
                menuItemRepository.save(pastelParaense);

                // Camarão Milanesa
                MenuItem camaraoMilanesa = new MenuItem();
                camaraoMilanesa.setName("Camarão Milanesa");
                camaraoMilanesa.setDescription("Camarão rosa empanado e frito vendido por unidade ou porção com 5 unidades");
                camaraoMilanesa.setPrice(0.00);
                camaraoMilanesa.setCategory("Comidas");
                camaraoMilanesa.setAvailable(true);
                camaraoMilanesa.getVariations().add(new MenuItemVariation(null, "Unidade", "SINGLE", 6.00, null, 1, camaraoMilanesa));
                camaraoMilanesa.getVariations().add(new MenuItemVariation(null, "Porção", "SINGLE", 25.00, null, 5, camaraoMilanesa));
                menuItemRepository.save(camaraoMilanesa);

                // // Polvo no espeto
                // MenuItem polvoNoEspeto = new MenuItem();
                // polvoNoEspeto.setName("Polvo no Espeto");
                // polvoNoEspeto.setDescription("Polvo no espeto frito na chapa acompanhado de arroz");
                // polvoNoEspeto.setPrice(20.00);
                // polvoNoEspeto.setCategory("Comidas");
                // polvoNoEspeto.setAvailable(true);
                // menuItemRepository.save(polvoNoEspeto);

                // Bubble
                MenuItem bubble = new MenuItem();
                bubble.setName("Bubble");
                bubble.setDescription("Suco com bolinhas saborizadas (300 ml)");
                bubble.setPrice(15.00);
                bubble.setCategory("Bebidas");
                bubble.setAvailable(true);
                menuItemRepository.save(bubble);

                // Seed Combo 1
                seedCombo1(hotSushi, takoyaki, gyoza, miniHotCoreano);
    }

    private void seedCombo1(MenuItem hotSushi, MenuItem takoyaki, MenuItem gyoza, MenuItem miniHotCoreano) {
        Combo combo1 = new Combo();
        combo1.setName("Combo 1");
        combo1.setDescription("3 Hot Sushi Salmão, 1 Takoyaki, 1 Gyoza e 1 Mini Hot Salsicha");
        combo1.setPrice(30.00); // Exemplo de preço
        combo1.setAvailable(true);

        // 3x Hot Sushi de Salmão (Unid)
        ComboItem ci1 = new ComboItem();
        ci1.setCombo(combo1);
        ci1.setMenuItem(hotSushi);
        ci1.setQuantity(3);
        MenuItemVariation v1 = hotSushi.getVariations().stream()
                .filter(v -> "De Salmão (Unid)".equals(v.getName())).findFirst().orElse(null);
        if (v1 != null) ci1.getAllowedVariations().add(v1);
        combo1.getItems().add(ci1);

        // 1x Takoyaki (No variation)
        ComboItem ci2 = new ComboItem();
        ci2.setCombo(combo1);
        ci2.setMenuItem(takoyaki);
        ci2.setQuantity(1);
        combo1.getItems().add(ci2);

        // 1x Gyoza (Unid)
        ComboItem ci3 = new ComboItem();
        ci3.setCombo(combo1);
        ci3.setMenuItem(gyoza);
        ci3.setQuantity(1);
        MenuItemVariation v3 = gyoza.getVariations().stream()
                .filter(v -> "Unidade (Unid)".equals(v.getName())).findFirst().orElse(null);
        if (v3 != null) ci3.getAllowedVariations().add(v3);
        combo1.getItems().add(ci3);

        // 1x Mini Hot Coreano De Salsicha
        ComboItem ci4 = new ComboItem();
        ci4.setCombo(combo1);
        ci4.setMenuItem(miniHotCoreano);
        ci4.setQuantity(1);
        MenuItemVariation v4 = miniHotCoreano.getVariations().stream()
                .filter(v -> "De Salsicha".equals(v.getName())).findFirst().orElse(null);
        if (v4 != null) ci4.getAllowedVariations().add(v4);
        combo1.getItems().add(ci4);

        comboRepository.save(combo1);
        System.out.println("Seeded Combo 1");
    }

    private void ensureVariationsSeeded() {
        checkAndSeedVariations("Tempurá", java.util.List.of(
            new MenuItemVariation(null, "De Legumes", "SINGLE", 0.00, null, 1, null),
            new MenuItemVariation(null, "Com Camarão", "SINGLE", 2.00, null, 1, null)
        ));

        checkAndSeedVariations("Pastel", java.util.List.of(
            new MenuItemVariation(null, "Queijo", "MULTIPLE", 2.00, null, 1, null),
            new MenuItemVariation(null, "Frango", "MULTIPLE", 2.00, null, 1, null),
            new MenuItemVariation(null, "Carne", "MULTIPLE", 2.00, null, 1, null),
            new MenuItemVariation(null, "Calabresa", "MULTIPLE", 2.00, null, 1, null),
            new MenuItemVariation(null, "Catupiry", "MULTIPLE", 2.00, null, 1, null)
        ));

        checkAndSeedVariations("Yakisoba", java.util.List.of(
            new MenuItemVariation(null, "Simples", "SINGLE", 0.00, null, 1, null),
            new MenuItemVariation(null, "Com Camarão", "SINGLE", 5.00, null, 1, null)
        ));
        
        checkAndSeedVariations("Hot Sushi", java.util.List.of(
            new MenuItemVariation(null, "De Salmão", "MULTIPLE", 0.00, null, 1, null),
            new MenuItemVariation(null, "De Camarão", "MULTIPLE", 0.00, null, 1, null)
        ));

        checkAndSeedVariations("Temaki", java.util.List.of(
            new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, null, 1, null),
            new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, null, 1, null)
        ));

        checkAndSeedVariations("Hot Ball", java.util.List.of(
            new MenuItemVariation(null, "De Salmão", "SINGLE", 0.00, null, 1, null),
            new MenuItemVariation(null, "De Camarão", "SINGLE", 0.00, null, 1, null)
        ));
        
        checkAndSeedVariations("Hot Coreano", java.util.List.of(
            new MenuItemVariation(null, "De Salsicha", "SINGLE", 0.00, null, 1, null),
            new MenuItemVariation(null, "De Salmão", "SINGLE", 2.00, null, 1, null),
            new MenuItemVariation(null, "De Camarão", "SINGLE", 2.00, null, 1, null)
        ));
        
        checkAndSeedVariations("Camarão Milanesa", java.util.List.of(
            new MenuItemVariation(null, "Unidade", "SINGLE", 6.00, null, 1, null),
            new MenuItemVariation(null, "Porção com 5 unidades", "SINGLE", 25.00, null, 5, null)
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
