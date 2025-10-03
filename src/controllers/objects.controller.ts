import { Request, Response } from 'express';
import { z } from 'zod';
import { BBox, Category } from '../domain/models';
import { isCategory } from '../domain/categories';
import { catalogService } from '../services/catalog.service';
import crypto from 'crypto';

const bboxSchema = z
  .string()
  .regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,\d+(\.\d+)?,-?\d+(\.\d+)?$/)
  .transform((v) => {
    const [minRA, minDec, maxRA, maxDec] = v.split(',').map((n) => parseFloat(n));
    return { minRA, minDec, maxRA, maxDec } as BBox;
  });

export async function listObjects(req: Request, res: Response) {
  const { category, bbox, page = '1', limit = '50' } = req.query as Record<string, string>;
  if (!category || !isCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const bboxParsed = bbox ? bboxSchema.safeParse(bbox) : undefined;
  if (bbox && !bboxParsed?.success) {
    return res.status(400).json({ error: 'Invalid bbox' });
  }
  const pageNum = Math.max(1, parseInt(page || '1', 10));
  const limitNum = Math.min(500, Math.max(1, parseInt(limit || '50', 10)));

  const { items, total, sources } = await catalogService.search(category as Category, bboxParsed?.success ? bboxParsed.data : undefined, pageNum, limitNum);
  const hasMore = pageNum * limitNum < total;

  // ETag for cacheable responses
  const body = { items, page: pageNum, total, hasMore };
  const etag = crypto.createHash('md5').update(JSON.stringify(body)).digest('hex');
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json(body);
}

export async function getObjectById(req: Request, res: Response) {
  const { id } = req.params;
  const { fields } = req.query as Record<string, string>;
  const result = await catalogService.getById(id);
  if (!result.item) {
    return res.status(404).json({ error: 'Not found' });
  }
  const allowed = new Set((fields || '').split(',').filter(Boolean));
  let payload: any = result.item;
  if (allowed.size) {
    payload = Object.fromEntries(Object.entries(result.item).filter(([k]) => allowed.has(k)));
    // always include sources for traceability
    if (result.item.sources) {
      payload.sources = result.item.sources;
    }
  }

  const etag = crypto.createHash('md5').update(JSON.stringify(payload)).digest('hex');
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'public, max-age=120');
  res.json(payload);
}
