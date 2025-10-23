import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config'; // Load .env variables
import { redis } from './src/config/redisClient.js'; 

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    // CORS config might be needed later if frontend is on a different port
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
});

// Simple test route
app.get('/', (req, res) => {
    res.send('FlowState Server is running!');
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});