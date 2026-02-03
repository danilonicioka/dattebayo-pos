package com.dattebayo.pos.service;

import com.dattebayo.pos.model.Configuration;
import com.dattebayo.pos.repository.ConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConfigurationService {

    private static final String PRICE_MARKUP_KEY = "PRICE_MARKUP";
    private static final String MARKUP_ENABLED_KEY = "MARKUP_ENABLED";

    @Autowired
    private ConfigurationRepository configurationRepository;

    public double getPriceMarkup() {
        return configurationRepository.findById(PRICE_MARKUP_KEY)
                .map(config -> Double.parseDouble(config.getConfigValue()))
                .orElse(0.0);
    }

    public void setPriceMarkup(double percentage) {
        Configuration config = new Configuration(PRICE_MARKUP_KEY, String.valueOf(percentage));
        configurationRepository.save(config);
    }

    public boolean isMarkupEnabled() {
        return configurationRepository.findById(MARKUP_ENABLED_KEY)
                .map(config -> Boolean.parseBoolean(config.getConfigValue()))
                .orElse(false);
    }

    public void setMarkupEnabled(boolean enabled) {
        Configuration config = new Configuration(MARKUP_ENABLED_KEY, String.valueOf(enabled));
        configurationRepository.save(config);
    }

    public double applyMarkup(double price) {
        if (!isMarkupEnabled()) {
            return Math.round(price);
        }
        double markup = getPriceMarkup();
        return Math.round(price * (1 + (markup / 100.0)));
    }
}
