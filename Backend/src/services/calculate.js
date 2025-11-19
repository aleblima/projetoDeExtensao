const calculateResult = (questions = [], userAnswerObject = {}) => {
    // ter ctz q veio alguma coisa
    if (!questions || !userAnswerObject) {
        return { error: "Perguntas ou respostas não fornecidas." };
    }

    // userAnswerObject.answers vem assim:
    // {
    //    1: { questionID: 1, value: 4, category: "analytics" },
    //    2: { questionID: 2, value: 5, category: "creativity" }
    // }

    const answers = userAnswerObject.answers || {};
    const scores = {};

    // passa pelas resposta enviada
    Object.values(answers).forEach((ans) => {
        if (!ans) return;

        const category = ans.category;  
        const value = Number(ans.value || 0);

        if (!scores[category]) scores[category] = 0;

        scores[category] += value;
    });

    // se nn tiver nada
    const entries = Object.entries(scores);
    if (entries.length === 0) {
        return { scores, recommendedArea: null };
    }

    // pega a maior categoria
    const topArea = entries.reduce((max, curr) =>
        curr[1] > max[1] ? curr : max
    );

    return {
        scores,
        recommendedArea: topArea[0]  // diz a area recomendada ne
    };
};

export { calculateResult };
