import { Router } from 'express';
import { listObjects, getObjectById } from '../controllers/objects.controller';

const router = Router();

router.get('/', listObjects);
router.get('/:id', getObjectById);

export default router;
