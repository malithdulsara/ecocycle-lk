package lk.ecocycle.backend.address.dto;

import lk.ecocycle.backend.address.Address;
import lk.ecocycle.backend.ward.Ward;

public record AddressResponse(
        Long id,
        String label,
        String addressLine,
        String city,
        double latitude,
        double longitude,
        boolean isDefault,
        Long wardId,
        String wardName,
        String councilName
) {
    public static AddressResponse from(Address address) {
        Ward ward = address.getWard();
        return new AddressResponse(
                address.getId(),
                address.getLabel(),
                address.getAddressLine(),
                address.getCity(),
                address.getLocation().getY(),
                address.getLocation().getX(),
                address.isDefaultAddress(),
                ward == null ? null : ward.getId(),
                ward == null ? null : ward.getName(),
                ward == null ? null : ward.getCouncil().getName()
        );
    }
}