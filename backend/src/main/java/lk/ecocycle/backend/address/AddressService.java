package lk.ecocycle.backend.address;

import lk.ecocycle.backend.address.dto.AddressRequest;
import lk.ecocycle.backend.address.dto.AddressResponse;

import java.util.List;

public interface AddressService {

    AddressResponse create(Long userId, AddressRequest request);

    List<AddressResponse> getMyAddresses(Long userId);

    void delete(Long userId, Long addressId);
}