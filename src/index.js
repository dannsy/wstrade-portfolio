import express from 'express';
import userRouter from './routers/user.router.js';
import portfolioRouter from './routers/portfolio.router.js';
import { errorHandlingMiddleware } from './middlewares/error.middleware.js';

const app = express();
const port = process.env.PORT;

// TODO: use morgan or something to log requests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Index route');
});

app.use('/user', userRouter);
app.use('/portfolio', portfolioRouter);

app.use(errorHandlingMiddleware);

app.listen(port, () => {
  console.log(`WS Trade api listening on port ${port}`);
});
