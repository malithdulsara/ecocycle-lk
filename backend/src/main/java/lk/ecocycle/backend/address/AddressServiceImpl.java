package lk.ecocycle.backend.address;

import lk.ecocycle.backend.address.dto.AddressRequest;
import lk.ecocycle.backend.address.dto.AddressResponse;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import lk.ecocycle.backend.common.geo.GeoUtils;
import lk.ecocycle.backend.user.User;
import lk.ecocycle.backend.user.UserRepository;
import lk.ecocycle.backend.ward.WardRepository;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final WardRepository wardRepository;

    public AddressServiceImpl(AddressRepository addressRepository, UserRepository userRepository,
                              WardRepository wardRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
        this.wardRepository = wardRepository;
    }

    @Override
    public AddressResponse create(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Point location = GeoUtils.toPoint(request.latitude(), request.longitude());

        // The first address is always the default one
        boolean makeDefault = Boolean.TRUE.equals(request.makeDefault()) || !addressRepository.existsByUserId(userId);
        if (makeDefault) {
            addressRepository.clearDefaultForUser(userId);
        }

        Address address = new Address();
        address.setUser(user);
        address.setLabel(request.label().trim());
        address.setAddressLine(request.addressLine().trim());
        address.setCity(request.city().trim());
        address.setLocation(location);
        address.setDefaultAddress(makeDefault);
        // PostGIS finds the ward automatically from the location
        address.setWard(wardRepository.findWardContaining(location.getY(), location.getX()).orElse(null));

        return AddressResponse.from(addressRepository.save(address));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(AddressResponse::from)
                .toList();
    }

    @Override
    public void delete(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        addressRepository.delete(address);

        // If the main address was deleted, make the oldest remaining address the main one
        if (address.isDefaultAddress()) {
            addressRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                    .filter(other -> !other.getId().equals(addressId))
                    .findFirst()
                    .ifPresent(other -> other.setDefaultAddress(true));
        }
    }
}