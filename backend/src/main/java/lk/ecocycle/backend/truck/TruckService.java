package lk.ecocycle.backend.truck;

import lk.ecocycle.backend.truck.dto.TruckRequest;
import lk.ecocycle.backend.truck.dto.TruckResponse;

import java.util.List;

public interface TruckService {

    List<TruckResponse> getAll();

    TruckResponse create(TruckRequest request);

    TruckResponse update(Long truckId, TruckRequest request);
}