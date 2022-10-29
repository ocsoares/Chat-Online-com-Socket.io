// CLIENTE !!! <<<

let io: any; // Declarei assim apenas para NÃO dar ERRO no TS Compilador, porque essa Variável está imbutida no script do HTML !! <<

const socket = io();

// emit = Emitir alguma informação = Script js
// on = Escutar alguma informação = Backend (websocket.ts)

interface ISendMessage {
    message: string;
    username: string;
    room: string;
    createdAt: Date;
}

interface IUserInformation {
    username: string;
    user_id: string;
    socket_id: string;
    room: string;
}

let connectedUserArray: IUserInformation[] = [];

socket.on('logoutUser', (connectedUser: IUserInformation[]) => {
    console.log('logoutUser:', connectedUser);

    removeUser(connectedUser);
});

socket.on('connectedUser', (data: IUserInformation[]) => {

    console.log('data no chatScript:', data);

    // const checkIfLogged = connectedUserArray.some(el => el.user_id ? true : false);
    // console.log('checkifLogged:', checkIfLogged);

    data.forEach(element => {
        if (!connectedUserArray.find(index => index.user_id === element.user_id)) {
            connectedUserArray.push(element);
            addUser(element.username);

        }
    });

    // connectedUserArray = data;
    // removeUser(connectedUserArray);

    console.log('connectedUserArray:', connectedUserArray);
});

const inputMessage = document.getElementById('msg') as HTMLElement;
const userID = document.getElementById('users') as HTMLElement;
const chatMessagesID = document.getElementById('chat-messages') as HTMLElement;

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

socket.on('sendMessage', (data: ISendMessage) => {
    // console.log('No navegador (chatScript):', data);
    console.log('messageDATA:', data);

    // A data estava vindo pelo evento 'sendMessage' como STRING, e não como Date, então tive que Converter para Date !! <<
    const convertToDate = new Date(data.createdAt).toLocaleString('pt-BR');

    addMessage(data.username, convertToDate, data.message);
});

function addUser(username: string) {

    userID.innerHTML += `
    <ul id="users">
        <li>
             ${username}
        </li>
    </ul>
    `;
}

function removeUser(arrayUsername: IUserInformation[]) {
    userID.innerHTML = '';

    arrayUsername.forEach(element => {
        userID.innerHTML += `
        <ul id="users">
            <li>
                 ${element.username}
            </li>
        </ul>
        `;
    });
}

function addMessage(username: string, date: Date | string, message: string) {

    // += Para SOMAR ao HTML Antes já Adicionado (IMPEDE que um Substitua o outro ) !! <<
    chatMessagesID.innerHTML += `
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