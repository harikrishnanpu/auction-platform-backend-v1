import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AuthRouterFactory } from '@presentation/http/factories/auth.router.factory';
import { container } from '@di/container';

export const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  }),
);
app.use(express.json());

app.use('/api/auth', AuthRouterFactory.authRouter(container));
