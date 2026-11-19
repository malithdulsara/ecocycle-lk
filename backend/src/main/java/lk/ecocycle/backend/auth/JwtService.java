package lk.ecocycle.backend.auth;

import lk.ecocycle.backend.user.User;

public interface JwtService {

    String generateAccessToken(User user);

    long accessTokenExpirySeconds();
}