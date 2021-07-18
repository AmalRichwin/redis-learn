import express, { response } from 'express';
import * as redis from 'redis';
import { Request, Response } from 'express';
import { promisify } from 'util';
import axios from 'axios';

const redis_url = 'redis://127.0.0.1:6379';

const app = express();
const client = redis.createClient(redis_url);

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  const { key } = req.body;
  const response = await getAsync(key);
  return res.json(response);
});

app.post('/', async (req: Request, res: Response) => {
  const { key, value } = req.body;
  console.log(key, value);
  const response = await setAsync(key, value);
  return res.json(response);
});

app.get('/user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  const cachedUser = await getAsync(`user-${userId}`);

  if (cachedUser) {
    return res.json(JSON.parse(cachedUser));
  } else {
    const response = await axios.get(`https://jsonplaceholder.typicode.com/photos/${userId}`);
    client.set(`user-${userId}`, JSON.stringify(response.data), 'EX', 10);
    return res.json(response.data);
  }
});

app.listen(3000, () => {
  console.log('Application started on port 3000!');
});
