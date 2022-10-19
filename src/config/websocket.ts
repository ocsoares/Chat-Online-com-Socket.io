import { io } from './exportServersAnd-io';

// socket = Utilizar quando é necessário funcionalidades para Usuários ESPECÍFICOS !! <<
// io = Usar quando é necessário utilizar funcionalides GERAIS, para TODOS conectados !! <<

io.on('connection', socket => {
    console.log(socket.id);

    socket.on('teste', (data) => {
        console.log(data);
    });
});