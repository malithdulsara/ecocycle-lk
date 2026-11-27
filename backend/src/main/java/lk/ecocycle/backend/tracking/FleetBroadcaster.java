package lk.ecocycle.backend.tracking;

import lk.ecocycle.backend.tracking.dto.TruckPosition;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

// Sends truck positions to everyone listening on the WebSocket
@Component
public class FleetBroadcaster {

    public static final String FLEET_TOPIC = "/topic/fleet";
    public static final String WARD_TOPIC_PREFIX = "/topic/wards/";

    private final SimpMessagingTemplate messagingTemplate;

    public FleetBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(TruckPosition position) {
        // Officers see every truck
        messagingTemplate.convertAndSend(FLEET_TOPIC, position);
        // Households see only the trucks in their own ward
        if (position.wardId() != null) {
            messagingTemplate.convertAndSend(WARD_TOPIC_PREFIX + position.wardId(), position);
        }
    }
}