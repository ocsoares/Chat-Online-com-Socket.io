import { io } from './exportServersAnd-io';

// NÃO consegui usar aqui, porque as Informações estão no Request, então usei na CLASSE para poder pegar do JWT !! <<
// OBS: Apagar depois esse arquivo !!

// socket = Utilizar quando é necessário funcionalidades para Usuários ESPECÍFICOS !! <<
// io = Usar quando é necessário utilizar funcionalides GERAIS, para TODOS conectados !! <<

// io.on('connection', socket => {
//     console.log(socket.id);

//     socket.on('teste', (data) => {
//         console.log(data);
//     });
// });