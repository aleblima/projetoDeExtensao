import { Router } from "express"; // pega o router (libera pra fazer rotas separadas)
import * as quizController from "../controllers/quiz.controller.js"; // importa o controller do quiz

const router = Router(); // cria um mini servidor de rotas

//pega as pergunta
router.get("/questions", quizController.getQuestions) // define rota GET pra pegar as perguntas

//envia resposta e calcula resultado
router.post("/submit", quizController.submitAnswers); // define rota POST pra enviar respostas
export default router; //exporta o router pra ser usado no app.js

