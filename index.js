import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config'; // Load .env variables
import {redisSubscriber } from './src/config/redisClient.js'; 
import { customRateLimiter } from './src/middleware/rateLimiter.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET",'POST']
    }
});

const PORT = process.env.PORT || 3000;

async function setupRedisSubscription(){
    await redisSubscriber.subscribe('rate-limit-events', (message)=>{
        console.log(`Recieved from Redis Pub/Sub: ${message}`);
        io.emit('rateLimitBlocked' ,JSON.parse(message));
    });
}

setupRedisSubscription();
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
});

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('public'));

const limitedRouteLimiter= customRateLimiter({
    secondsWindow: 15,
    allowedHits: 5,
})
// Simple test route
app.get('/', (req, res) => {
    res.send('FlowState Server is running!');
});

app.get('/limited',limitedRouteLimiter,(req,res)=>{
   res.send('Accessed limited route!');
});

app.get('/dashboard', (req,res)=>{
    res.render('dashboard');
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});