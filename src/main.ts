import express from 'express';
import cors from 'cors';
import { AuthRouterFactory } from '@presentation/http/factories/auth.router.factory';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', AuthRouterFactory.authRouter());
