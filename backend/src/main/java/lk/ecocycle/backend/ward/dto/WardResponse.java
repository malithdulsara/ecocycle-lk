package lk.ecocycle.backend.ward.dto;

import lk.ecocycle.backend.common.geo.GeoUtils;
import lk.ecocycle.backend.ward.Ward;

import java.util.List;

public record WardResponse(
        Long id,
        Long councilId,
        String councilName,
        String name,
        String wardCode,
        List<List<Double>> boundary
) {
    public static WardResponse from(Ward ward) {
        return new WardResponse(
                ward.getId(),
                ward.getCouncil().getId(),
                ward.getCouncil().getName(),
                ward.getName(),
                ward.getWardCode(),
                GeoUtils.toCoordinateList(ward.getBoundary())
        );
    }
}