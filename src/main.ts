import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AuthRouterFactory } from '@presentation/http/factories/auth.router.factory';
import { container } from '@di/container';
import { errorMiddleware } from '@presentation/http/middlewares/error.middleware';
import { EmailWorker } from '@infrastructure/workers/email.worker';
import { TemplateService } from '@infrastructure/services/template/template.service';
import cookieParser from 'cookie-parser';

export const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  }),
);

app.use(express.json());

app.use(cookieParser());

new EmailWorker(new TemplateService());

app.use('/api/v1/auth', AuthRouterFactory.authRouter(container));

app.use(errorMiddleware);
