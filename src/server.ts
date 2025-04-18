import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

import userRoute from './routes/userRoute';
import chatRoute from './routes/chatRoutes';
import watchlistRoute from './routes/watchlistRoutes';
import FriendRoute from './routes/friendRoutes';
import animeRoute from './routes/animeRoute';
import CommunityRoute from './routes/communityRoutes';
import notificationRoute from './routes/notificationRoute';

dotenv.config();



const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use('/assets', express.static(path.join(process.cwd(), 'src', 'Assets')));
app.use('/api/users', userRoute);
app.use('/api/chat', chatRoute);
app.use('/api/watchlist', watchlistRoute);
app.use('/api/friend', FriendRoute);
app.use('/api/anime', animeRoute);
app.use('/api/community', CommunityRoute);
app.use('/api/notification', notificationRoute);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ===== PRIVATE CHAT EVENTS (KEEP THESE UNCHANGED) =====
  
  // Join a private room for direct messages
  socket.on('join', (userId: number) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room: user_${userId}`);
  });

  // Handle online status
  socket.on('online', (userId: number) => {
    io.emit('user_online', userId);
    console.log(`User ${userId} is online`);
  });

  // Handle offline status
  socket.on('offline', (userId: number) => {
    io.emit('user_offline', userId);
    console.log(`User ${userId} is offline`);
  });

  // Handle private messages
  socket.on('private_message', async (data: { 
    senderId: number,
    receiverId: number, 
    content: string  
  }) => {
    const { senderId, receiverId, content } = data;
    
    io.to(`user_${senderId}`).to(`user_${receiverId}`).emit('new_message', {
      senderId,
      receiverId,
      content, 
      createdAt: new Date().toISOString()
    });
  });

  // ===== COMMUNITY CHAT EVENTS (NEW) =====
  
  // Join a community room
  socket.on('joinCommunity', (communityId: string) => {
    socket.join(`community_${communityId}`);
    console.log(`User joined community room: community_${communityId}`);
  });

  // Leave a community room
  socket.on('leaveCommunity', (communityId: string) => {
    socket.leave(`community_${communityId}`);
    console.log(`User left community room: community_${communityId}`);
  });

  // Handle community messages
  socket.on('community_message', (data: {
    communityId: number,
    userId: number,
    content: string,
    id?: number,
    createdAt?: string,
    user?: {
      name: string,
      profile: string
    }
  }) => {
    // Format the message with current time if not provided
    const message = {
      ...data,
      createdAt: data.createdAt || new Date().toISOString()
    };
    
    // Broadcast to everyone in the community room
    io.to(`community_${data.communityId}`).emit('community_message', message);
    
    console.log(`Community message sent to community_${data.communityId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});