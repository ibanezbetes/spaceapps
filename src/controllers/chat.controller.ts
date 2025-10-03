import { Request, Response } from 'express';
import { z } from 'zod';
import { catalogService } from '../services/catalog.service';
import { env } from '../config/env';
import { generateObjectCard } from '../services/llm.service';

const bodySchema = z.object({
  question: z.string().min(1).max(2000).optional()
});

export async function chatForObject(req: Request, res: Response) {
  const { id } = req.params;
  const stream = (req.query.stream === 'true') && env.ENABLE_SSE;
  const parse = bodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid body' });
  }

  const result = await catalogService.getById(id);
  if (!result.item) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (!stream) {
    const card = await generateObjectCard(result.item, parse.data.question, false);
    return res.json(card);
  }

  // SSE mode: emit the answer progressively (simple chunking)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    const card = await generateObjectCard(result.item, parse.data.question, true);
    const chunks = JSON.stringify(card).match(/.{1,256}/g) || [];
    for (const c of chunks) {
      res.write(`data: ${c}\n\n`);
    }
    res.write('event: end\n');
    res.write('data: done\n\n');
    res.end();
  } catch (err: any) {
    res.write('event: error\n');
    res.write(`data: ${JSON.stringify({ message: err?.message || 'LLM error' })}\n\n`);
    res.end();
  }
}
