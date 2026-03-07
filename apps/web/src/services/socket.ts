import { io } from 'socket.io-client';
import { API_URL } from './api';

export const socket = io(API_URL, {
    autoConnect: true,
    transports: ['websocket'], // Prefer explicit websocket transport
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
    console.log('WebSocket connection error:', error.message);
});
