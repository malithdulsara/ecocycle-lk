package lk.ecocycle.backend.truck;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TruckRepository extends JpaRepository<Truck, Long> {

    @EntityGraph(attributePaths = "council")
    List<Truck> findAllByOrderByRegistrationNumberAsc();

    @EntityGraph(attributePaths = "council")
    List<Truck> findByActiveTrueOrderByRegistrationNumberAsc();

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByRegistrationNumberAndIdNot(String registrationNumber, Long id);
}