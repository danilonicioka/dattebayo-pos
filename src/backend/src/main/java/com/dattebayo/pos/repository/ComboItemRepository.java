package com.dattebayo.pos.repository;

import com.dattebayo.pos.model.ComboItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboItemRepository extends JpaRepository<ComboItem, Long> {
}
