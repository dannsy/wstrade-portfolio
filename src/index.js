import express from 'express';

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Index route');
});

app.listen(port, () => {
  console.log(`WS Trade api listening on port ${port}`);
});
