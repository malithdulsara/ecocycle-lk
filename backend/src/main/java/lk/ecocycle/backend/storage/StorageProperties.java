package lk.ecocycle.backend.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

// app.storage.upload-dir in application.yml: the folder where uploaded photos are saved
@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(String uploadDir) {
}