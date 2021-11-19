import express from 'express';
import userController from './controllers/user.controller.js';
import portfolioController from './controllers/portfolio.controller.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Index route');
});

app.use('/user', userController);
app.use('/portfolio', portfolioController);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`WS Trade api listening on port ${port}`);
});
