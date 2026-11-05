import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (user) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[Socket Client] Connected to UrbanPulse real-time mesh:', socket.id);
      if (user) {
        socket.emit('join_user', user.id || user._id);
        socket.emit('join_role', user.role);
        if (user.department) {
          socket.emit('join_department', user.department._id || user.department);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('[Socket Client] Disconnected from server');
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
