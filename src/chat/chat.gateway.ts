import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: Map<string, Socket> = new Map();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }
    this.clients.set(userId, client);
    await this.chatService.getUnreadMessages(userId).then(async (messages) => {
      messages.forEach((msg) => {
        client.emit('message', {
          from: msg.from,
          to: msg.to,
          message: msg.message,
        });
      });

      await this.chatService.markMessagesAsRead(messages.map((m) => m.id));
    });
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.clients.entries()].find(
      ([, sock]) => sock.id === client.id,
    )?.[0];
    if (userId) {
      this.clients.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody()
    data: { from: string; to: string; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const { from, to, message } = data;
    await this.chatService.saveMessage(from, to, message);

    // 보내는 사람에게도 echo
    socket.emit('message', { from, to, message });

    // 받는 사람에게 메시지 전송
    const toClient = this.clients.get(to);
    if (toClient) {
      toClient.emit('message', { from, to, message });
    }
  }

  sendMessageToUser(to: string, from: string, message: string) {
    const socket = this.clients.get(to);
    if (socket) {
      socket.emit('message', { from, message });
    }
  }
}
