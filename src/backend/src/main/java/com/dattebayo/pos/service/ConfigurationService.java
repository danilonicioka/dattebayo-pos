package com.dattebayo.pos.service;

import com.dattebayo.pos.model.Configuration;
import com.dattebayo.pos.repository.ConfigurationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConfigurationService {

    @Autowired
    private ConfigurationRepository configurationRepository;
}
