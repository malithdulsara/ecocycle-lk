package lk.ecocycle.backend.storage;

import lk.ecocycle.backend.common.ApiResponse;
import lk.ecocycle.backend.storage.dto.FileUploadResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    // Logged-in users: upload one photo (form-data, field name "file")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FileUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeImage(file);
        return ApiResponse.ok("Photo uploaded", new FileUploadResponse(fileName, "/api/v1/files/" + fileName));
    }

    // Guests (no login): upload a photo for a guest complaint. Same 5 MB and image-only rules.
    @PostMapping(value = "/guest", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FileUploadResponse> uploadAsGuest(@RequestParam("file") MultipartFile file) {
        return upload(file);
    }

    // Public: show a photo on a web page (file names are random, so they cannot be guessed)
    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> download(@PathVariable String fileName) {
        Resource file = fileStorageService.load(fileName);
        MediaType type = MediaTypeFactory.getMediaType(fileName).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok()
                .contentType(type)
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS))
                .body(file);
    }
}