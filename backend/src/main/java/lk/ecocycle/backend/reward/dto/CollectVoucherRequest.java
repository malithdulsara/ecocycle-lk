package lk.ecocycle.backend.reward.dto;

import jakarta.validation.constraints.NotBlank;

public record CollectVoucherRequest(
        // e.g. "VCH-8M2K4Q7P"
        @NotBlank(message = "Voucher code is required")
        String voucherCode
) {
}