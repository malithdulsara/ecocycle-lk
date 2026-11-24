package lk.ecocycle.backend.wastetype;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WasteTypeRepository extends JpaRepository<WasteType, Long> {

    List<WasteType> findAllByOrderBySortOrderAsc();
}