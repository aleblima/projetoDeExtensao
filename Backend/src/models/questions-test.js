const questions = [
    {
        id: 1,
        type: "scale",
        category: "analytics",
        question: "O quanto você gosta de analisar dados?",
        options: {
            min: 1,
            max: 5,
            labels: {
                1: "Discordo completamente",
                5: "Concordo plenamente"
            }
        }
    },
    {
        id: 2,
        type: "scale",
        category: "creativity",
        question: "O quanto você gosta de atividades criativas?",
        options: {
            min: 1,
            max: 5,
            labels: {
                1: "Discordo completamente",
                5: "Concordo plenamente"
            }
        }
    }
];

export { questions };