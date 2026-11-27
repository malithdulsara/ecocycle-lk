package lk.ecocycle.backend.config;

import lk.ecocycle.backend.tracking.FleetBroadcaster;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;
import java.util.Set;

// WebSocket security.
// CONNECT: the browser sends "Authorization: Bearer <access token>" as a STOMP header.
// SUBSCRIBE: /topic/fleet is for staff only, /topic/wards/{id} for any logged-in user.
@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    private static final String BEARER = "Bearer ";
    private static final Set<String> STAFF_ROLES = Set.of("ROLE_ADMIN", "ROLE_COUNCIL_OFFICER");

    private final JwtDecoder jwtDecoder;

    public StompAuthInterceptor(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }
        StompCommand command = accessor.getCommand();
        if (command == StompCommand.CONNECT) {
            accessor.setUser(authenticate(accessor.getFirstNativeHeader("Authorization")));
        } else if (command == StompCommand.SUBSCRIBE) {
            checkSubscription(accessor.getUser(), accessor.getDestination());
        } else if (command == StompCommand.SEND) {
            // The browser only listens. Positions are sent with the REST API.
            throw new AccessDeniedException("Sending messages is not allowed");
        }
        return message;
    }

    private Authentication authenticate(String header) {
        if (header == null || !header.startsWith(BEARER)) {
            throw new AccessDeniedException("Login required");
        }
        try {
            Jwt jwt = jwtDecoder.decode(header.substring(BEARER.length()));
            List<String> roles = jwt.getClaimAsStringList("roles");
            List<GrantedAuthority> authorities = roles == null ? List.of() : roles.stream()
                    .map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role))
                    .toList();
            return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
        } catch (JwtException e) {
            throw new AccessDeniedException("Login expired. Please sign in again.");
        }
    }

    private void checkSubscription(Principal user, String destination) {
        if (!(user instanceof Authentication auth) || destination == null) {
            throw new AccessDeniedException("Login required");
        }
        if (destination.equals(FleetBroadcaster.FLEET_TOPIC)) {
            boolean staff = auth.getAuthorities().stream().anyMatch(a -> STAFF_ROLES.contains(a.getAuthority()));
            if (!staff) {
                throw new AccessDeniedException("Only council staff can see the whole fleet");
            }
            return;
        }
        if (destination.matches(FleetBroadcaster.WARD_TOPIC_PREFIX + "\\d+")) {
            return;
        }
        throw new AccessDeniedException("Unknown topic");
    }
}