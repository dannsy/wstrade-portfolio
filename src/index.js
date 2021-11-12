import express from 'express';
import authRouter from './controllers/auth.js';

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Index route');
});

app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`WS Trade api listening on port ${port}`);
});
