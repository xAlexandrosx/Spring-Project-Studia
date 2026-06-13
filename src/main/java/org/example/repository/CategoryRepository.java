package org.example.repository;

import org.example.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByOwnerId(Long ownerId);

    boolean existsByNameAndOwnerId(String name, Long ownerId);

    Optional<Category> findByIdAndOwnerId(Long id, Long ownerId);
}
