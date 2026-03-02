import axios from 'axios';

// Puxa a URL corretamente lida do .env injetada pelo Babel
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});
