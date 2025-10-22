document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formLogin');
    const msgContainer = document.getElementById('mensagem-container'); // O novo elemento HTML

    // Função para exibir mensagens na tela
    function displayMessage(type, message) {
        msgContainer.style.borderColor = type === 'success' ? '#4CAF50' : '#f44336';
        msgContainer.style.backgroundColor = type === 'success' ? '#e8f5e9' : '#ffebee';
        msgContainer.style.color = type === 'success' ? '#1b5e20' : '#b71c1c';
        msgContainer.innerHTML = message;
    }

    // Função assíncrona para lidar com o login
    async function fazerLogin(event) {
        event.preventDefault();

        // Limpa mensagens anteriores
        msgContainer.innerHTML = '';
        msgContainer.style.borderColor = 'transparent';

        // 1. Obtém os valores dos campos
        const nome = document.getElementById('nome').value.trim();
        const telefone = document.getElementById('telefone').value.trim();

        // 2. Validação Front-end
        if (nome === '') {
            displayMessage('error', 'Por favor, preencha o campo Nome.');
            return;
        }
        const numerosTelefone = telefone.replace(/\D/g, '');
        if (numerosTelefone.length < 10 || numerosTelefone.length > 11) {
            displayMessage('error', 'Por favor, insira um número de telefone com 10 ou 11 dígitos (incluindo o DDD).');
            return; 
        }

        const dadosFormulario = { nome: nome, telefone: numerosTelefone };
        const apiUrl = 'http://localhost:8000/login'; 

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosFormulario)
            });

            const data = await response.json();
            
            if (response.ok) {
                // SUCESSO (Status 200-299)
                let successHtml = `<h4>✅ Login Bem-Sucedido!</h4>`;
                successHtml += `<p><strong>Status do Sistema:</strong> ${data.message}</p>`;
                successHtml += `<p><strong>Seu ID:</strong> ${data.aluno_id}</p>`;
                
                if (data.curso) {
                    successHtml += `<p><strong>Curso Realizado:</strong> ${data.curso}</p>`;
                } else {
                    successHtml += `<p><strong>Próximo Passo:</strong> Prossiga para o questionário.</p>`;
                }

                displayMessage('success', successHtml);
                
                // Ex: Redirecionar
                // setTimeout(() => window.location.href = '/questionario.html', 3000); 

            } else {
                // ERRO (Status 4xx ou 5xx)
                let errorMessage = "Erro desconhecido. Por favor, tente novamente.";

                if (data && data.detail) {
                    errorMessage = data.detail; 
                } 

                // Exibe a mensagem de erro detalhada do FastAPI
                displayMessage('error', `<h4>❌ Erro ao Acessar (${response.status})</h4><p>${errorMessage}</p>`);
            }

        } catch (error) {
            // Erros de rede (servidor offline, CORS, etc.)
            displayMessage('error', '<h4>❌ Erro de Conexão</h4><p>Não foi possível conectar ao servidor. Verifique se o backend está rodando.</p>');
            console.error('Erro de rede:', error);
        }
    }

    form.addEventListener('submit', fazerLogin);
});