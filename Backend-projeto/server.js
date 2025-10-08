import app from "../src/app.js"; // chama o app 


//se existir uma variável de ambiente (process.env.port) ele usa, aí se não, é a porta 3000
const PORT = process.env.PORT || 3000; // a porta do sv

//inicia o servidor e manda uma mensagem no console
app.listen(PORT, () => {
	console.log('servidor rodando na porta ${PORT}');
});
