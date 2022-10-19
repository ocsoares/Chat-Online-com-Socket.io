let io: any; // Declarei assim apenas para NÃO dar ERRO no TS Compilador, porque essa Variável está imbutida no script do HTML !! <<

const socket = io();
console.log('SOCKET:', socket);

// emit = Emitir alguma informação = Script js
// on = Escutar alguma informação = Backend (websocket.ts)

socket.emit('teste', {
    message: 'Apenas testando boy...'
});