package lk.ecocycle.backend.storage.dto;

// fileName is what you send back in other requests (e.g. photoFileName). url is where the photo can be viewed.
public record FileUploadResponse(String fileName, String url) {
}