import { io } from 'socket.io-client';
import { SOCKET_URL } from './api';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket'],
});

socket.on('connect', () => {
    console.log('Mobile connected to WebSocket server');
});

socket.on('disconnect', () => {
    console.log('Mobile disconnected from WebSocket server');
});

socket.on('connect_error', (error) => {
    console.log('Mobile WebSocket connection error:', error.message);
});
