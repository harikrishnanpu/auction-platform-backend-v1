import { TYPES } from '@di/types.di';
import { Container } from 'inversify';
import { Router } from 'express';
import { AuctionController } from '../controllers/auction/auction.controller';
import { AuthenticateMiddleware } from '../middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '../middlewares/authorize.middleware';
import { AuctionRoutes } from '../routes/auction/auction.routes';

export class AuctionRouterFactory {
  public static auctionRouter(container: Container): Router {
    const auctionController = container.get<AuctionController>(
      TYPES.AuctionController,
    );
    const authenticateMiddleware = container.get<AuthenticateMiddleware>(
      TYPES.AuthenticateMiddleware,
    );
    const authorizeMiddleware = container.get<AuthorizeMiddleware>(
      TYPES.AuthorizeMiddleware,
    );
    const auctionRoutes = new AuctionRoutes(
      authenticateMiddleware,
      authorizeMiddleware,
      auctionController,
    );
    return auctionRoutes.register();
  }
}
