package lk.ecocycle.backend.system;

import lk.ecocycle.backend.common.ApiResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    private final JdbcTemplate jdbcTemplate;

    public SystemController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/ping")
    public ApiResponse<Map<String, Object>> ping() {
        String postgisVersion = jdbcTemplate.queryForObject("SELECT postgis_version()", String.class);

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("service", "ecocycle-backend");
        info.put("status", "UP");
        info.put("database", "connected");
        info.put("postgis", postgisVersion);
        return ApiResponse.ok(info);
    }
}