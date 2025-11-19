import { calculateResult } from "../services/calculate.js";
import { questions } from "../models/questions-test.js";
import { validateAnswers } from "../services/validate.js";


async function processAnswers (req, res) {
    try {
        const data = req.body;
        const answers = data.answers;

        if (!data || !data.answers) {
            console.error('Erro: Respostas não fornecidas');
            return res.status(400).json({ error: 'Respostas não fornecidas' });
        }

        const errors = validateAnswers(answers,questions.length);

        if (errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await calculateResult(questions, answers);

        return res.json(result);
    } catch (error) {
        console.error('Erro:', error);
        return res.status(500).json({ error: 'Erro no servidor ao receber respostas' });
    }
};

export {
    processAnswers,
};