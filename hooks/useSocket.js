'use client';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Mock Socket.IO connection - replace with real WS_URL when ready
    const mockSocket = {
      connected: true,
      on: (event, callback) => {
        // Store listeners for mock event simulation
        if (!mockSocket._listeners) mockSocket._listeners = {};
        if (!mockSocket._listeners[event]) mockSocket._listeners[event] = [];
        mockSocket._listeners[event].push(callback);
      },
      emit: (event, data) => {
        console.log(`[Mock Socket] Emitting ${event}:`, data);
        // In mock mode, we can simulate immediate responses or delayed responses
      },
      off: (event, callback) => {
        if (mockSocket._listeners && mockSocket._listeners[event]) {
          mockSocket._listeners[event] = mockSocket._listeners[event].filter(cb => cb !== callback);
        }
      },
      disconnect: () => {
        mockSocket.connected = false;
        setConnected(false);
      },
      // Utility for simulating incoming events (dev/demo use)
      simulateEvent: (event, data) => {
        if (mockSocket._listeners && mockSocket._listeners[event]) {
          mockSocket._listeners[event].forEach(callback => callback(data));
        }
      }
    };

    // TODO: Replace mock with real Socket.IO connection
    // const realSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
    //   auth: { token }
    // });
    // realSocket.on('connect', () => setConnected(true));
    // realSocket.on('disconnect', () => setConnected(false));

    socketRef.current = mockSocket;
    setSocket(mockSocket);
    setConnected(true);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, isAuthenticated]);

  return { socket, connected };
};