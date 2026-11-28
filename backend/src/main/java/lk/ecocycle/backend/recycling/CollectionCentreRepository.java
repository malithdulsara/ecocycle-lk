package lk.ecocycle.backend.recycling;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollectionCentreRepository extends JpaRepository<CollectionCentre, Long> {

    List<CollectionCentre> findAllByOrderByNameAsc();

    List<CollectionCentre> findByActiveTrueOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}