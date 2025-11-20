import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Get or create socket instance with JWT authentication
 */
export const getSocket = (): Socket => {
  // If socket already exists and is connected, return it
  if (socket && socket.connected) {
    return socket;
  }

  // If socket exists but is not connected, clean it up first
  if (socket && !socket.connected) {
    socket.removeAllListeners();
    socket = null;
  }

  // Create new socket instance
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;

  socket = io(SOCKET_URL, {
    auth: {
      token: token || '',
    },
    extraHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

/**
 * Disconnect socket and clean up all listeners
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('Disconnecting socket...');

    // Remove all listeners to prevent memory leaks
    socket.removeAllListeners();

    // Disconnect if connected
    if (socket.connected) {
      socket.disconnect();
    }

    // Clear the reference
    socket = null;
  }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

/**
 * Reconnect socket with new token (useful after login)
 */
export const reconnectSocket = (): void => {
  disconnectSocket();
  getSocket();
};
