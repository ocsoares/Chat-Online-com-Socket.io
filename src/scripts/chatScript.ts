let io: any; // Declarei assim apenas para NÃO dar ERRO no TS Compilador, porque essa Variável está imbutida no script do HTML !! <<

const socket = io();

// emit = Emitir alguma informação = Script js
// on = Escutar alguma informação = Backend (websocket.ts)

interface ISendMessage {
    createdAt: Date;
    message: string;
    room: string;
    updatedAt: string;
    username: string;
}

const inputMessage = document.getElementById('msg') as HTMLElement;

// event: any para ter Acesso ao .value !! <<
inputMessage.addEventListener('keypress', (event: KeyboardEvent | any) => {
    if (event.key === 'Enter') {
        const sendMessage = event.target.value;

        socket.emit('sendMessage', {
            message: sendMessage
        });

        // NÃO é possível alterar DIRETO pelo sendMessage (com let, óbvio) !! <<
        event.target.value = '';

        event.preventDefault(); // IMPEDE o Auto Reload após Enviar a Mensagem !! <<
    }
});

socket.on('sendMessage', (data: any) => {
    // console.log('No navegador (chatScript):', data);

    console.log(typeof data.createdAt);

    const teste = new Date();
    console.log(teste);
    console.log(typeof teste);

    const chatMessages = document.getElementById('chat-messages') as HTMLElement;

    // += Para SOMAR ao HTML Antes já Adicionado (IMPEDE que um Substitua o outro ) !! <<
    chatMessages.innerHTML += `
    <div class="message">
        <p class="meta">${data.username} <span>${data.createdAt.toLocaleString('pt-BR')}</span></p>
            <p class="text">
                ${data.message}
        </p>
    </div>
    `;
});