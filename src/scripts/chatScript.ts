// CLIENTE !!! <<<

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
interface IUserInformation {
    username: string;
    user_id: string;
    socket_id: string;
}

let connectedUser: object = {};
let connectedUsersArray: object[] = [];

socket.on('connectedUser', (data: IUserInformation) => {
    connectedUser = data;
    console.log(connectedUser);

    connectedUsersArray.push(connectedUser);
    console.log('connectedUsersARRAY:', connectedUsersArray);

    addMessage('Conectado:', 'Qualquer hora', data as any);
});

let teste = null;
console.log('teste FORA:', teste);

// Tirar o User do Array quando sair !! <<
socket.on('disconnectUser', (data: IUserInformation) => {
    teste = 'caiu aqui';
    console.log('TESTE DENTRO:', teste);
    console.log(`O usuário com socket '${data.socket_id}' foi disconectado !`);
});

socket.on('test-room', (data: any) => {
    console.log('data:', data);
});

const inputMessage = document.getElementById('msg') as HTMLElement;

socket.on('initialMessage', (data: string) => {
    const currentDate = new Date().toLocaleString('pt-BR');

    addMessage('ChatPapo', currentDate, data);
});

socket.on('userLogout', (data: string) => {
    console.log('userLogout:', data);
});

const scrollDown = document.getElementById('chat-messages') as HTMLElement;

scrollDown.scrollTop = scrollDown.scrollHeight; // Scroll para BAIXO !! 

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

socket.on('sendMessage', (data: any, res: any) => {
    // console.log('No navegador (chatScript):', data);
    console.log('RES:', res);

    // A data estava vindo pelo evento 'sendMessage' como STRING, e não como Date, então tive que Converter para Date !! <<
    const convertToDate = new Date(data.createdAt).toLocaleString('pt-BR');

    addMessage(data.username, convertToDate, data.message);
});

function addMessage(username: string, date: Date | string, message: string) {
    const chatMessages = document.getElementById('chat-messages') as HTMLElement;

    // += Para SOMAR ao HTML Antes já Adicionado (IMPEDE que um Substitua o outro ) !! <<
    chatMessages.innerHTML += `
    <div class="message">
        <p class="meta">${username} <span>${date}</span></p>
            <p class="text">
                ${message}
        </p>
    </div>
    `;

    // Cada Mensagem adicionada, o scroll vai AUTOMATICAMENTE para baixo !! <<
    scrollDown.scrollTop = scrollDown.scrollHeight;
}