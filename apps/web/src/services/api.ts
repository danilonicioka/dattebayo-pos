import axios from 'axios';

// Default to local NestJS API on port 3000
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});
