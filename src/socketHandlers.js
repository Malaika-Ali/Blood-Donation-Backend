import jwt from 'jsonwebtoken';
import { User } from './models/user.model.js';
export const setupSocketHandlers = (io) => {
    const connectedUsers = new Map();

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

            if (!user) {
                return next(new Error('Authentication error: Invalid token'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error: ' + (error.message || 'Invalid token')));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user._id}, Socket ID: ${socket.id}`);
        connectedUsers.set(socket.user._id.toString(), socket.id);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user._id}, Socket ID: ${socket.id}`);
            connectedUsers.delete(socket.user._id.toString());
        });

        // Add any other event listeners here
    });

    return {
        emitToUser: (userId, event, data) => {
            const socketId = connectedUsers.get(userId.toString());
            if (socketId) {
                io.to(socketId).emit(event, data);
            }
        },
        emitToUsers: (userIds, event, data) => {
            userIds.forEach(userId => {
                const socketId = connectedUsers.get(userId.toString());
                if (socketId) {
                    io.to(socketId).emit(event, data);
                }
            });
        }
    };
};

