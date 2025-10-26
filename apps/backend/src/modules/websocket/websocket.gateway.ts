import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '../../common/logger/logger.service';
// Removed WebSocketService import to avoid circular dependency

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/snaktox',
})
export class SnaKToxWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger();

  constructor() {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Join client to general room
    client.join('general');
    
    // Send welcome message
    client.emit('connected', {
      message: 'Connected to SnaKTox real-time updates',
      clientId: client.id,
      timestamp: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { room: string; userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room, userId } = data;
    
    this.logger.log(`Client ${client.id} joining room: ${room}`);
    
    client.join(room);
    
    if (userId) {
      client.data.userId = userId;
    }
    
    client.emit('joined_room', {
      room,
      message: `Joined room: ${room}`,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = data;
    
    this.logger.log(`Client ${client.id} leaving room: ${room}`);
    
    client.leave(room);
    
    client.emit('left_room', {
      room,
      message: `Left room: ${room}`,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('subscribe_sos_updates')
  handleSubscribeSosUpdates(
    @MessageBody() data: { hospitalId?: string; responderId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { hospitalId, responderId } = data;
    
    this.logger.log(`Client ${client.id} subscribing to SOS updates`);
    
    // Join relevant rooms based on subscription
    if (hospitalId) {
      client.join(`hospital:${hospitalId}`);
    }
    
    if (responderId) {
      client.join(`responder:${responderId}`);
    }
    
    // Join general SOS updates room
    client.join('sos_updates');
    
    client.emit('subscribed_sos', {
      message: 'Subscribed to SOS updates',
      subscriptions: { hospitalId, responderId },
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('subscribe_hospital_updates')
  handleSubscribeHospitalUpdates(
    @MessageBody() data: { hospitalId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { hospitalId } = data;
    
    this.logger.log(`Client ${client.id} subscribing to hospital updates for: ${hospitalId}`);
    
    client.join(`hospital:${hospitalId}`);
    client.join('hospital_updates');
    
    client.emit('subscribed_hospital', {
      message: 'Subscribed to hospital updates',
      hospitalId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('subscribe_stock_updates')
  handleSubscribeStockUpdates(
    @MessageBody() data: { hospitalId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { hospitalId } = data;
    
    this.logger.log(`Client ${client.id} subscribing to stock updates`);
    
    if (hospitalId) {
      client.join(`stock:${hospitalId}`);
    }
    
    client.join('stock_updates');
    
    client.emit('subscribed_stock', {
      message: 'Subscribed to stock updates',
      hospitalId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      message: 'pong',
      timestamp: new Date(),
    });
  }

  // Public methods for broadcasting updates
  broadcastSosUpdate(sosReport: any) {
    this.logger.log(`Broadcasting SOS update: ${sosReport.id}`);
    
    // Broadcast to general SOS updates room
    this.server.to('sos_updates').emit('sos_update', {
      type: 'sos_update',
      data: sosReport,
      timestamp: new Date(),
    });
    
    // Broadcast to specific hospital room if assigned
    if (sosReport.hospitalId) {
      this.server.to(`hospital:${sosReport.hospitalId}`).emit('sos_assigned', {
        type: 'sos_assigned',
        data: sosReport,
        timestamp: new Date(),
      });
    }
    
    // Broadcast to responder room
    if (sosReport.responderId) {
      this.server.to(`responder:${sosReport.responderId}`).emit('sos_status_update', {
        type: 'sos_status_update',
        data: sosReport,
        timestamp: new Date(),
      });
    }
  }

  broadcastHospitalUpdate(hospitalId: string, update: any) {
    this.logger.log(`Broadcasting hospital update for: ${hospitalId}`);
    
    // Broadcast to specific hospital room
    this.server.to(`hospital:${hospitalId}`).emit('hospital_update', {
      type: 'hospital_update',
      data: update,
      timestamp: new Date(),
    });
    
    // Broadcast to general hospital updates room
    this.server.to('hospital_updates').emit('hospital_update', {
      type: 'hospital_update',
      data: { hospitalId, ...update },
      timestamp: new Date(),
    });
  }

  broadcastStockUpdate(hospitalId: string, stockUpdate: any) {
    this.logger.log(`Broadcasting stock update for hospital: ${hospitalId}`);
    
    // Broadcast to specific hospital stock room
    this.server.to(`stock:${hospitalId}`).emit('stock_update', {
      type: 'stock_update',
      data: stockUpdate,
      timestamp: new Date(),
    });
    
    // Broadcast to general stock updates room
    this.server.to('stock_updates').emit('stock_update', {
      type: 'stock_update',
      data: { hospitalId, ...stockUpdate },
      timestamp: new Date(),
    });
  }

  broadcastEmergencyAlert(alert: any) {
    this.logger.log(`Broadcasting emergency alert: ${alert.sosReportId}`);
    
    // Broadcast to all connected clients
    this.server.emit('emergency_alert', {
      type: 'emergency_alert',
      data: alert,
      timestamp: new Date(),
    });
    
    // Broadcast to specific hospital room
    if (alert.hospitalId) {
      this.server.to(`hospital:${alert.hospitalId}`).emit('emergency_assignment', {
        type: 'emergency_assignment',
        data: alert,
        timestamp: new Date(),
      });
    }
  }

  getConnectedClients(): number {
    return this.server.sockets.sockets.size;
  }

  getRoomClients(room: string): number {
    const roomSockets = this.server.sockets.adapter.rooms.get(room);
    return roomSockets ? roomSockets.size : 0;
  }
}
