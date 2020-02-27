import express from 'express';
import path from 'path';
import * as Sentry from '@sentry/node';
import './database';
import 'express-async-errors';
import Youth from 'youch';
import sentryConfig from './config/sentry';
import routes from './Routes';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandlers();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandlers() {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youth(err, req).toJSON();
      return res.status(500).json(errors);
    });
  }
}

export default new App().server;
