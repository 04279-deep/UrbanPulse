let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.IO] User ${userId} joined room user_${userId}`);
      }
    });

    socket.on('join_role', (role) => {
      if (role) {
        socket.join(`role_${role}`);
        console.log(`[Socket.IO] Client joined role_${role}`);
      }
    });

    socket.on('join_department', (deptId) => {
      if (deptId) {
        socket.join(`dept_${deptId}`);
        console.log(`[Socket.IO] Client joined dept_${deptId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId}`).emit(event, data);
  }
};

export const emitToRole = (role, event, data) => {
  if (ioInstance && role) {
    ioInstance.to(`role_${role}`).emit(event, data);
  }
};

export const emitToDepartment = (deptId, event, data) => {
  if (ioInstance && deptId) {
    ioInstance.to(`dept_${deptId}`).emit(event, data);
  }
};

export const broadcastEvent = (event, data) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
};
