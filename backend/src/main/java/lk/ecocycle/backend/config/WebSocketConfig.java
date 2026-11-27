package lk.ecocycle.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// Live updates: the browser connects to ws://localhost:8080/ws and subscribes to /topic/...
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthInterceptor stompAuthInterceptor;

    public WebSocketConfig(StompAuthInterceptor stompAuthInterceptor) {
        this.stompAuthInterceptor = stompAuthInterceptor;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Same origin as CorsConfig (the Vite dev server)
        registry.addEndpoint("/ws").setAllowedOrigins("http://localhost:5173");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Simple in-memory broker. Messages to /topic/... go to every subscriber.
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Checks the login token and who may listen to what
        registration.interceptors(stompAuthInterceptor);
    }
}