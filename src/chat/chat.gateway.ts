import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private users: Map<string, Socket> = new Map(); // userId ↔ socket

  handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      this.users.set(userId, socket);
      console.log(`🔌 ${userId} connected`);
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      this.users.delete(userId);
      console.log(`❌ ${userId} disconnected`);
    }
  }

  @SubscribeMessage('private_message')
  handlePrivateMessage(
    @MessageBody() data: { to: string; message: string },
    @ConnectedSocket() senderSocket: Socket,
  ) {
    const senderId = senderSocket.handshake.query.userId;
    const targetSocket = this.users.get(data.to);

    if (targetSocket) {
      targetSocket.emit('message', {
        from: senderId,
        message: data.message,
      });
    }
  }
}
