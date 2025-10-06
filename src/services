import questions from "../data/questions.json" assert {type: json}; // traz as perguntas do json


// retorna todas as perguntas
export const getQuestions = () => {
	return questions;
};


//recebe as respostas e calcula a pontuação final
export const calculateResult = (answers) => {
	const scores = {}; // objeto pra guardar a pontuação de cada área

	// iniciar áreas com zero

	questions.forEach((q) => {
		scores[q.area] = scores[q.area] || 0;
	});

	//somar pontos de acordo com a resposta
	answers.forEach((ans) => {
		const question = questions.find((q) => q.id === and.questionId) // encontra a pergunta correspondente com o ID da resposta;
		if (question) {
			scores[question.area] += ans.value;
		}
	});
        //achar a área que teve mais pontos feitos
	const topArea = Object.entries(scores).reduce((max, curr) =>
	curr[1] > max[1] ? curr : max
	);

	return {
		scores,
		recommendedArea: topArea[0]
	};
};       
