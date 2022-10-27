import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
import { io } from '../config/exportServersAnd-io';
import { MessageModel } from '../models/MessageModel';
import { ISendMessage, IUserInformation } from '../@types/interfaces';

// >> COLOCAR na Pasta do Curso Udemy Tipagens TS !! <<
// Tipando um Array de Objetos !! = { [key: string]: string[]; } = {};

let connectedUsers: object[] = [];

export class ChatController {
    async enterChat(req: Request, res: Response) {
        // Fazer um JWT com NOME e ROOM, direcionar para o CHAT e BLOQUEAR essa Rota se estiver "logado" !! <<
        const { username, room } = req.body;

        try {
            const saveUser = new UserModel({ username, room });

            await saveUser.save();

            const searchThisUser = await UserModel.findOne({ username, room });

            const JWT = jwt.sign({
                username,
                room,
                id: searchThisUser!.id
            }, "" + process.env.JWT_HASH, {
                expiresIn: '5h'
            });

            res.cookie('chat_cookie', JWT, { signed: true });

            return res.redirect('/chat');
        }
        catch (error: any) {
            console.log(error.message);
            return res.redirect('/');
        }
    }

    async blockIfEnterChat(req: Request, res: Response, next: NextFunction) {
        const { chat_cookie } = req.signedCookies;

        try {
            const verifyJWT = jwt.verify(chat_cookie, process.env.JWT_HASH as string);

            if (verifyJWT) {
                return res.redirect('/chat');
            }
        }
        catch (error: any) {
            console.log(error.message);

            if (error.message === 'jwt expired') {
                res.clearCookie('chat_cookie');
            }

            next();
        }
    }

    async checkIfEnterChat(req: Request, res: Response, next: NextFunction) {
        const { chat_cookie } = req.signedCookies;

        try {
            const verifyJWT = jwt.verify(chat_cookie, process.env.JWT_HASH as string);

            if (verifyJWT) {
                req.JWT = verifyJWT;
                next();
            }
        }
        catch (error: any) {
            // console.log(error.message);
            return res.redirect('/');
        }
    }

    async logout(req: Request, res: Response) {
        const { username, room, id } = req.JWT;

        try {
            await UserModel.findOneAndDelete({ username });

            res.clearCookie('chat_cookie');

            // LIMPAR o LocalStorage por AQUI quando Deslogar !! <<

            io.on('connection', socket => {
                console.log('SOCKET LOG', socket.id);
            });

            return res.redirect('/');
        }
        catch (error: any) {
            console.log(error.message);
            res.clearCookie('chat_cookie');
            return res.redirect('/');
        }
    }

    // SERVIDOR !!! <<<
    // Usei por aqui porque precisa, no meu caso, ter o JWT que vem do Request !! <<  
    async webSocket(req: Request, res: Response, next: NextFunction) {
        const { username, room, id } = req.JWT;
        console.log('username:', username, 'room:', room, 'id:', id);

        // broadcast = Envia para TODOS, MENOS para você mesmo Conectado !! <<

        // Troquei on por once porque estava REPETINDO o socket.id VÁRIAS vezes !!
        io.once('connection', async socket => {
            console.log('socket ID:', socket.id);

            socket.join(room);

            const userInformation: IUserInformation = {
                username,
                user_id: id,
                socket_id: socket.id,
                room
            };

            type TCheckID = { user_id?: string; };

            // Confere CADA Valor de uma especificada Chave DENTRO de um Array e verifica se EXISTE (boolean), 
            // se SIM, retorna true, se NÃO, retorna false !! <<
            // FAZER para APENAS dar push se NÃO existir !!!!! <<<<  
            // REMOVER do push no Logout !!!!!! <<<<
            const teste = connectedUsers.some((el: TCheckID) => el.user_id === id);
            console.log('TESTE Antes:', teste);

            // IMPORTANTE: Declarei o Array de Objetos FORA da Classe, porque estava RESETANDO a cada Recarregamento da Página !! <<
            connectedUsers.push(userInformation);
            console.log('connectedUsers:', connectedUsers);

            const teste_dois = connectedUsers.some((el: TCheckID) => el.user_id === id);
            console.log('TESTE DEPOIS:', teste_dois);

            socket.broadcast.to(room).emit('connectedUser', userInformation);

            socket.on('connectedUser', data => {
                console.log('connectedUser:', data);
            });

            // Tentar SALVAR o socket.id no Banco de Dados e Salvar NOVAMENTE sempre que ele for Atualizado !!
            const sockets = (await io.fetchSockets()).map(socket => socket.id);
            console.log('fetchSockets:', sockets);

            socket.emit('initialMessage', `Bem-vindo ao ChatPapo e à sala ${room} !`);

            socket.on('sendMessage', async (data: ISendMessage, callback: Function) => {
                // Salvando a Mensagem
                data.message = data.message;
                data.username = username;
                data.room = room;

                console.log(data);

                let saveMessage: any;

                try {
                    saveMessage = new MessageModel({
                        message: data.message,
                        username: data.username,
                        room: data.room
                    });

                    await saveMessage.save();
                }
                catch (error: any) {
                    console.log(error.message);
                }

                // Enviando a Mensagem para a SALA específicada
                io.to(data.room).emit('sendMessage', saveMessage);
            });
        });

        next();
    }
}