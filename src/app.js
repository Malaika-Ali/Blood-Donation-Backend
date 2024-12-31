import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http';
import { Server } from 'socket.io';

const app=express()
const server = http.createServer(app);
// const io = new Server(server);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', 
        
        //  origin: '*:*', 

        methods: ['GET', 'POST'], // Allowed methods
        credentials: true // Allow credentials (cookies, authorization headers, etc.)
    },
    allowEIO3: true, // Add if using legacy clients
});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// configuartion to accept form data in the form of json
app.use(express.json({
    limit: "16kb"
}))

// handle data coming from URLs like params
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

// folder to keep files like images or pdfs
app.use(express.static("public"))

app.use(cookieParser())


import userRouter from './routes/user.routes.js'
import bloodRequestRouter from './routes/bloodrequest.routes.js'

// Routes declaration
app.use('/api/v1/users', userRouter)
app.use('/api/v1/requests', bloodRequestRouter)


// Socket.IO connection
console.log("Entering the socket's logic")
io.on('connection', (socket) => {
    console.log(`A user connected with socket ID: ${socket.id}`);

    socket.emit('notification', 'This is a test notification!');
    console.log("notification sent")
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
    

    // You can also store the socket ID with the user's ID if needed
    // For example, you can maintain a mapping of user IDs to socket IDs
});

// Example event for notifications


export {app, io}


