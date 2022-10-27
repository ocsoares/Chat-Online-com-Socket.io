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
    room: string;
}

socket.on('connectedUser', (data: IUserInformation[]) => {
    console.log('DATA:', data);
});

// OBS: Tive que usar Promise porque NÃO estavam pegando os Valores da Variável dentro do Evento ou
// de uma Variável externa !! <<

// socket.on('connectedUser', (data: IUserInformation[]) => {
//     console.log('sem Promise:', data);
// });

// socket.on('yourAccount', (data: IUserInformation) => {
//     console.log('yourAccount:', data);
// });

// const getUserInformation = new Promise<IUserInformation>((resolve, reject) => {
// socket.on('yourAccount', (data: IUserInformation) => {
//     console.log('yourAccount:', data);
//     socket.on('connectedUser', (user: IUserInformation[]) => {
//         console.log('connectedUser:', user);
//         user.forEach(element => {
//             addUser(element.username);
//         });
//     });
//     // resolve(data);
// });
// });

// const getConnectedUser = new Promise<IUserInformation[]>((resolve, reject) => {
//     socket.on('connectedUser', (data: IUserInformation[]) => {
//         resolve(data);
//     });
// });

// getUserInformation.then(async (userInformation) => {
//     console.log('data:', userInformation);

//     // await socket.on('connectedUser', (data: IUserInformation[]) => {
//     //     console.log('sem Promise:', data);
//     // });
// });

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

function addUser(username: string) {
    const userID = document.getElementById('users') as HTMLElement;

    userID.innerHTML += `
    <ul id="users">
        <li>
             ${username}
        </li>
    </ul>
    `;
}

function addMessage(username: string, date: Date | string, message: string) {
    const chatMessagesID = document.getElementById('chat-messages') as HTMLElement;

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