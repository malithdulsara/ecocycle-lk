package lk.ecocycle.backend.recycling;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface DropOffItemRepository extends JpaRepository<DropOffItem, Long> {

    @EntityGraph(attributePaths = {"wasteType", "campaign"})
    List<DropOffItem> findByDropOffIdInOrderByIdAsc(Collection<Long> dropOffIds);
}