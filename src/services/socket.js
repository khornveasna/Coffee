// Socket.IO Service for Real-time Sync
class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }

    initialize(io) {
        this.io = io;

        io.on('connection', (socket) => {
            console.log('🔌 Client connected:', socket.id);

            // User login - register socket
            socket.on('user-login', (userData) => {
                this.connectedUsers.set(socket.id, userData);
                
                // Broadcast user status to all clients
                this.broadcast('user-status', {
                    userId: userData.id,
                    fullname: userData.fullname,
                    online: true,
                    socketId: socket.id
                });

                // Send current online users to the newly connected user
                const onlineUsers = Array.from(this.connectedUsers.values());
                socket.emit('online-users', onlineUsers);
            });

            // User logout
            socket.on('user-logout', () => {
                const userData = this.connectedUsers.get(socket.id);
                if (userData) {
                    this.connectedUsers.delete(socket.id);
                    
                    this.broadcast('user-status', {
                        userId: userData.id,
                        fullname: userData.fullname,
                        online: false,
                        socketId: socket.id
                    });
                }
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log('🔌 Client disconnected:', socket.id);
                const userData = this.connectedUsers.get(socket.id);
                
                if (userData) {
                    this.connectedUsers.delete(socket.id);
                    
                    this.broadcast('user-status', {
                        userId: userData.id,
                        fullname: userData.fullname,
                        online: false,
                        socketId: socket.id
                    });
                }
            });

            // Handle custom events
            socket.on('order-created', (data) => {
                this.broadcast('order-created', data, socket.id);
            });

            socket.on('order-deleted', (data) => {
                this.broadcast('order-deleted', data, socket.id);
            });

            socket.on('product-created', (data) => {
                this.broadcast('product-created', data, socket.id);
            });

            socket.on('product-updated', (data) => {
                this.broadcast('product-updated', data, socket.id);
            });

            socket.on('product-deleted', (data) => {
                this.broadcast('product-deleted', data, socket.id);
            });

            socket.on('user-created', (data) => {
                this.broadcast('user-created', data, socket.id);
            });

            socket.on('user-updated', (data) => {
                this.broadcast('user-updated', data, socket.id);
            });

            socket.on('user-deleted', (data) => {
                this.broadcast('user-deleted', data, socket.id);
            });
        });

        console.log('✅ Socket.IO initialized');
        return io;
    }

    // Broadcast event to all connected clients except sender
    broadcast(event, data, excludeSocketId = null) {
        if (!this.io) {
            console.warn('Socket.IO not initialized');
            return;
        }

        if (excludeSocketId) {
            this.io.to(excludeSocketId).broadcast.emit(event, data);
        } else {
            this.io.emit(event, data);
        }
    }

    // Broadcast to specific room
    broadcastToRoom(room, event, data) {
        if (!this.io) {
            console.warn('Socket.IO not initialized');
            return;
        }

        this.io.to(room).emit(event, data);
    }

    // Get connected users count
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    // Get all connected users
    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }
}

// Export singleton instance
const socketService = new SocketService();
module.exports = socketService;
