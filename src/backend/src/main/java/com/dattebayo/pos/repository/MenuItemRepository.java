package com.dattebayo.pos.repository;

import com.dattebayo.pos.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByAvailableTrue();
    List<MenuItem> findByCategoryAndAvailableTrue(String category);
    List<MenuItem> findByCategory(String category);
    java.util.Optional<MenuItem> findByName(String name);
}
