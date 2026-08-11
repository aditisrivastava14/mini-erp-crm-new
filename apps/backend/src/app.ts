import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import * as morgan from './middlewares/morgan';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorConverter, errorHandler } from './middlewares/errorMiddleware';
import { ApiError } from './utils/ApiError';
import { httpStatus } from './constants/httpStatus';
import routes from './routes';
import { API_PREFIX } from '@gigflow/shared';
import { swaggerSpec } from './docs/swagger';

export const app: Express = express();

// Render sits behind a proxy, so trust its forwarded headers.
app.set('trust proxy', 1);

if (env.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

// enable cors
app.use(cors({
  origin: [
    env.clientUrl,
    "http://localhost:5173"
  ],
  credentials: true,
}));
app.options('*', cors());

app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve);
app.get(['/api-docs', '/api-docs/'], swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'GigFlow CRM API Docs',
}));

// limit repeated failed requests to endpoints
if (env.env === 'production') {
  app.use(API_PREFIX, apiLimiter);
}

// v1 api routes
app.use(API_PREFIX, routes);

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Route not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);
