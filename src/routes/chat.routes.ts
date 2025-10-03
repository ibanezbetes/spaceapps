import { Router } from 'express';
import { chatForObject } from '../controllers/chat.controller';

const router = Router();

router.post('/:id', chatForObject);

export default router;
