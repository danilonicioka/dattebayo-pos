package com.dattebayo.pos.service;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SocketService {

    private final SocketIOServer server;

    @Autowired
    public SocketService(SocketIOServer server) {
        this.server = server;
    }

    public void broadcastOrderUpdate() {
        // Evento genérico para a Web
        server.getBroadcastOperations().sendEvent("orderUpdated");
        // Eventos específicos para o Mobile
        server.getBroadcastOperations().sendEvent("order_created");
        server.getBroadcastOperations().sendEvent("order_updated");
        System.out.println("📢 WebSocket: Eventos 'orderUpdated', 'order_created' e 'order_updated' enviados.");
    }
}
