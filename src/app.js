import express from "express"; // importa o express, pra simplificar a criação de svs
import quizRoutes from "./routes/quiz.routes.js"; // importa as rota

const app = express(); // cria o sv express

app.use(express.json()); // libera pra receber e enviar json no body

//rota principa, define o prefixo "/api/quiz" pras rotas do quiz
app.use("/api/quiz", quizRoutes);

export default app: // exporta o app pro server.js usar
