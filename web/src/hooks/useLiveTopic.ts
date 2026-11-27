import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { tokenStorage } from '../auth/tokenStorage';
import { WS_URL } from '../utils/tracking';

// Listens to a WebSocket topic (e.g. "/topic/fleet") and calls onMessage with each message.
// Pass null as the topic to stay disconnected. Returns true while connected.
export function useLiveTopic<T>(topic: string | null, onMessage: (message: T) => void): boolean {
  const [connected, setConnected] = useState(false);
  // Keep the latest callback without reconnecting every time the page renders
  const callback = useRef(onMessage);
  useEffect(() => {
    callback.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!topic) {
      return;
    }
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000, // try again after 5 s if the connection drops
      // Read the token on every (re)connect, so a refreshed token is used
      beforeConnect: (stomp) => {
        stomp.connectHeaders = { Authorization: `Bearer ${tokenStorage.getAccessToken() ?? ''}` };
      },
      onConnect: () => {
        setConnected(true);
        client.subscribe(topic, (frame) => callback.current(JSON.parse(frame.body) as T));
      },
      onWebSocketClose: () => setConnected(false),
    });
    client.activate();
    return () => {
      void client.deactivate();
    };
  }, [topic]);

  return topic !== null && connected;
}