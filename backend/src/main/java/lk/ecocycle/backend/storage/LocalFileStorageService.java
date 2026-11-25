package lk.ecocycle.backend.storage;

import lk.ecocycle.backend.common.exception.BadRequestException;
import lk.ecocycle.backend.common.exception.ResourceNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class LocalFileStorageService implements FileStorageService {

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024; // 5 MB

    // Allowed photo types and the file extension we save them with
    private static final Map<String, String> IMAGE_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    // Only names we created ourselves: a UUID + one of our extensions. Blocks "../../secret.txt" style names.
    private static final Pattern SAFE_NAME = Pattern.compile("^[a-f0-9\\-]{36}\\.(jpg|png|webp)$");

    private final Path uploadDir;

    public LocalFileStorageService(StorageProperties properties) {
        this.uploadDir = Path.of(properties.uploadDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create upload folder " + uploadDir, e);
        }
    }

    @Override
    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please choose a photo");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("Photo must be 5 MB or smaller");
        }
        String extension = IMAGE_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new BadRequestException("Only JPG, PNG or WEBP photos are allowed");
        }

        String fileName = UUID.randomUUID() + "." + extension;
        try (InputStream input = file.getInputStream()) {
            Files.copy(input, uploadDir.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not save the photo", e);
        }
        return fileName;
    }

    @Override
    public Resource load(String fileName) {
        if (!exists(fileName)) {
            throw new ResourceNotFoundException("File not found");
        }
        try {
            return new UrlResource(uploadDir.resolve(fileName).toUri());
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found");
        }
    }

    @Override
    public boolean exists(String fileName) {
        return fileName != null
                && SAFE_NAME.matcher(fileName).matches()
                && Files.isRegularFile(uploadDir.resolve(fileName));
    }
}