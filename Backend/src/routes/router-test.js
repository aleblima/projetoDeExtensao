import express from 'express';
import { processAnswers } from '../controllers/result.js';
import { getQuestions } from '../controllers/sendQuestion.js';

const router = express.Router();

router.post('/respostas', processAnswers);
router.get('/perguntas', getQuestions);

export {
    router
};

