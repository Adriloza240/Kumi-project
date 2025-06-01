import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const value = await kv.get(req.query.key);
    return res.status(200).send(value);
  }

  if (req.method === 'POST') {
    await kv.set(req.body.key, req.body.value);
    return res.status(200).json({ success: true });
  }
}