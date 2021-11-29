import express from 'express';
import morgan from 'morgan';
import { mongoConnect } from './config/mongo.js';
import userRouter from './routers/user.router.js';
import portfolioRouter from './routers/portfolio.router.js';
import { errorHandlingMiddleware } from './middlewares/error.middleware.js';

async function main() {
  await mongoConnect();

  const app = express();
  const port = process.env.PORT;

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(morgan('dev'));

  app.get('/', (req, res) => {
    res.send('Index route');
  });

  app.use('/user', userRouter);
  app.use('/portfolio', portfolioRouter);

  app.use(errorHandlingMiddleware);

  app.listen(port, () => {
    console.log(`WS Trade api listening on port ${port}`);
  });
}

main().catch((err) => console.error(err));
