import { Module } from '@nestjs/common';
import { SnaKToxWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';

@Module({
  providers: [SnaKToxWebSocketGateway, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}
