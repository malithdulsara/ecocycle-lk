package lk.ecocycle.backend.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

// Saves uploaded photos. Today they go to a local folder; later we can add a Cloudinary/S3 version
// of this interface without changing the rest of the code.
public interface FileStorageService {

    // Saves the photo and returns the new file name, e.g. "3f2a...c1.jpg"
    String storeImage(MultipartFile file);

    // Loads a saved file for download
    Resource load(String fileName);

    boolean exists(String fileName);
}