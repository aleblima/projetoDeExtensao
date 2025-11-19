function validateAnswers(answers, expectedLength){
    const errors = [];

    if (typeof answers !== 'object' || answers === null){
        errors.push("Respostas em formato inválido.");
        return errors;
    }

    const receivedKeys = Object.keys(answers);

    if (receivedKeys.length === 0){
        errors.push("Nenhuma resposta fornecida.");
        return errors;
    }

    if (receivedKeys.length !== expectedLength){
        errors.push(`Número incorreto de respostas. Esperado: ${expectedLength}, Recebido: ${receivedKeys.length}.`);
        return errors;
    }

    return errors;
}

export { validateAnswers };
