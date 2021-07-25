import express from 'express';
import * as redis from 'redis';
import { Request, Response } from 'express';
import { promisify } from 'util';
import { getAsync, redis_url, setAsync } from './index';

const router = express.Router();

const client = redis.createClient(redis_url);

/**
 * Lists in Redis
 */

/**
 * @method lPushXAsync
 * push data to list from the left == start of the list if the list is created
 */
const lPushXAsync = promisify(client.lpushx).bind(client);

/**
 * @method lPushXAsync
 * push data to list from the right == end of the list
 */
const rPushXAsync = promisify(client.rpushx).bind(client);

/**
 * @method lRangeAsync
 * to get data from list
 */
const lRangeAsync = promisify(client.lrange).bind(client);

/**
 * @method llenAsync
 * get the length of list
 */
const llenAsync = promisify(client.llen).bind(client);

/**
 * @method lPopAsync
 * removes an item from left
 */
const lPopAsync = promisify(client.lpop).bind(client);

/**
 * @method rPopAsync
 * removes an item from right
 */
const rPopAsync = promisify(client.rpop).bind(client);
/**
 * @method rPopAsync
 * removes an item if available or waits for the timeout
 */
const blPopAsync = promisify(client.blpop).bind(client);

/**
 * @method lInsertAsync
 * insert an item either before or after an item whicch is specified
 */
const lInsertAsync = promisify(client.linsert).bind(client);

/**
 * @method lInsertAsync
 * insert an item either before or after an item whicch is specified
 */
const lIndexAsync = promisify(client.lindex).bind(client);

/**
 * @method lInsertAsync
 * insert an item either before or after an item whicch is specified
 */
// const lSc = promisify(client).bind(client);

router.get('/country', async (req: Request, res: Response) => {
  try {
    const response = await lRangeAsync('country', 0, -1);
    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.get('/country/count', async (req: Request, res: Response) => {
  try {
    const response = await llenAsync('country');
    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post('/country/add/left', async (req: Request, res: Response) => {
  try {
    const { countryName } = req.body;
    const response = await lPushXAsync('country', countryName);
    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post('/country/add/right', async (req: Request, res: Response) => {
  try {
    const { countryName } = req.body;
    const response = await rPushXAsync('country', countryName);
    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post('/country/remove/left', async (req: Request, res: Response) => {
  try {
    const response = await lPopAsync('country');
    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post('/country/remove/right', async (req: Request, res: Response) => {
  try {
    const response = await rPopAsync('country');
    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.post('/country/insert', async (req: Request, res: Response) => {
  const { countryName, countryNameToInsert, type } = req.body;
  try {
    const response = await lInsertAsync('country', type, countryName, countryNameToInsert);
    return res.json(response);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

router.get('/country/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const response = await lIndexAsync('country', +id);
    if (response) return res.json(response);
    return res.status(400).json({ message: 'COUNTRY NOT FOUND' });
  } catch (error) {
    return res.status(400).json({ error });
  }
});
router.get('/country/blpop', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const response = await client.blpop('movies', 1);
    // const response = await blPopAsync();
    if (response) return res.json(response);
    return res.status(400).json({ message: 'COUNTRY NOT FOUND' });
  } catch (error) {
    return res.status(400).json({ error });
  }
});

export default router;
