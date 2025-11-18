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
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'https://web-peach-one-55.vercel.app',
      process.env.WEB_URL,
      'http://localhost:3000',
    ],
    credentials: true,
  },
})
export class AuctionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private userSockets: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up user socket mapping
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket.id === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('subscribe_auction')
  handleSubscribeAuction(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`auction:${data.auctionId}`);
    console.log(`Client ${client.id} subscribed to auction ${data.auctionId}`);
    return { event: 'subscribed', data: { auctionId: data.auctionId } };
  }

  @SubscribeMessage('unsubscribe_auction')
  handleUnsubscribeAuction(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`auction:${data.auctionId}`);
    console.log(
      `Client ${client.id} unsubscribed from auction ${data.auctionId}`,
    );
    return { event: 'unsubscribed', data: { auctionId: data.auctionId } };
  }

  // Broadcast new bid to all subscribers of an auction
  broadcastNewBid(auctionId: string, bid: any) {
    this.server.to(`auction:${auctionId}`).emit('new_bid', {
      auctionId,
      bid,
      timestamp: new Date(),
    });
  }

  // Broadcast auction end to all subscribers
  broadcastAuctionEnd(auctionId: string, winner: any) {
    this.server.to(`auction:${auctionId}`).emit('auction_ended', {
      auctionId,
      winner,
      timestamp: new Date(),
    });
  }

  // Broadcast price update
  broadcastPriceUpdate(auctionId: string, currentPrice: number) {
    this.server.to(`auction:${auctionId}`).emit('price_update', {
      auctionId,
      currentPrice,
      timestamp: new Date(),
    });
  }
}
