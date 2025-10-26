import { Module } from '@nestjs/common';
import { SosController } from './sos.controller';
import { SosService } from './sos.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [NotificationsModule, WebSocketModule],
  controllers: [SosController],
  providers: [SosService],
})
export class SosModule {}
