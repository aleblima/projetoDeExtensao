import { questions } from "../models/questions-test.js";

 async function getQuestions(req, res){
    try {
        return res.json(questions);
    } catch (error) {
        console.error('Erro ao obter perguntas:', error);
        return res.status(500).json({ error: 'Erro ao obter perguntas' });
    }
}

export {
    getQuestions,
};