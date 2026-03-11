import { createServer } from 'http';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { menuRoutes } from './menu/menu.routes';
import { ordersRoutes } from './orders/orders.routes';

const app = new Hono();
const prisma = new PrismaClient();

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
}));

// Health check
app.get('/', (c) => c.json({ status: 'ok', message: 'Dattebayo POS API' }));

// Mount routes
app.route('/menu', menuRoutes(prisma));
app.route('/orders', ordersRoutes(prisma));

// Create HTTP server
const httpServer = createServer(async (req, res) => {
  try {
    const url = `http://${req.headers.host}${req.url}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }

    const chunks: Uint8Array[] = [];
    await new Promise<void>((resolve) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', resolve);
    });
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

    const honoReq = new Request(url, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const honoRes = await app.fetch(honoReq);

    res.statusCode = honoRes.status;
    honoRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const buf = await honoRes.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

// Attach Socket.IO to the same HTTP server
export const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

const PORT = parseInt(process.env.PORT ?? '3000', 10);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dattebayo POS API running on http://0.0.0.0:${PORT}`);
});
