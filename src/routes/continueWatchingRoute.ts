import express from 'express';
import { addContinueWatching, getContinueWatching, deleteContinueWatching } from '../controllers/continueWatchingController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/add',authMiddleware ,addContinueWatching);
router.get('/get', authMiddleware, getContinueWatching);
router.delete('/delete/:id', authMiddleware, deleteContinueWatching);

export default router;