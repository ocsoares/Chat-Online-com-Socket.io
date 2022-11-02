import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
import { io } from '../config/exportServersAnd-io';
import { MessageModel } from '../models/MessageModel';
import { ISendMessage, IUserInformation } from '../@types/interfaces';
import { redisClient } from '../config/redisConfig';

// >> COLOCAR na Pasta do Curso Udemy Tipagens TS !! <<
// Tipando um Array de Objetos !! = { [key: string]: string[]; } = {};

let connectedUsers: IUserInformation[] = [];
let connectedUsersByRoom: IUserInformation[] = [];

export class ChatController {
    async enterChat(req: Request, res: Response) {
        const { username, room } = req.body;

        if (!username || !room) {
            req.flash('errorFlash', 'Preencha corretamente todos os campos !');
            return res.redirect('/');
        }

        const checkIfUsernameLogged = connectedUsers.some(el => el.username === username && el.room === room);

        if (checkIfUsernameLogged) {
            if (Object.hasOwnProperty.bind(req.signedCookies)('chat_cookie')) {
                res.clearCookie('chat_cookie');
            }

            req.flash('errorFlash', 'Já existe um usuário conectado nessa sala com esse nome !');
            return res.redirect('/');
        }

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

            // const checkIfJWTBlackList = await redisClient.get(`blackList_${chat_cookie}`);

            // if (checkIfJWTBlackList) {
            //     res.clearCookie('chat_cookie');
            //     req.flash('errorFlash', 'Token inválido ou expirado !');
            //     // return res.redirect('/'); // Como JÁ VAI Limpar o cookie, vai Redirecionar sozinho...
            // }

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
        const { chat_cookie } = req.signedCookies;
        const { username, room, id } = req.JWT;

        try {
            await UserModel.findOneAndDelete({ username });

            connectedUsers = connectedUsers.filter(element => {
                if (element.user_id !== id) {
                    return element;
                }
            });

            connectedUsersByRoom = connectedUsers.filter((element) => {
                if (element.room === room) {
                    return element;
                }
            });

            io.to(room).emit('logoutUser', connectedUsersByRoom);

            // const redisExpireTime = 18000; // 5 Horas ! <<

            // await redisClient.set(`blackListJWT_${chat_cookie}`, chat_cookie, 'EX', redisExpireTime);

            res.clearCookie('chat_cookie');

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

        // socket = Envia para TODOS, MENOS para você mesmo Conectado !! <<

        // Troquei on por once porque estava REPETINDO o socket.id VÁRIAS vezes !!
        io.once('connection', async socket => {
            console.log('socket ID:', socket.id);

            socket.join(room);

            socket.on('closeNavBar', (data) => {
                console.log('closeNavBar:', data);
            });

            const userInformation: IUserInformation = {
                username,
                user_id: id,
                socket_id: socket.id,
                room
            };

            // Confere CADA Valor de uma especificada Chave DENTRO de um Array e verifica se EXISTE (boolean), 
            // se SIM, retorna true, se NÃO, retorna false !! <<
            const checkIfLogged = connectedUsers.some(el => el.user_id === id);

            // IMPORTANTE: Declarei o Array de Objetos FORA da Classe, porque estava RESETANDO a cada Recarregamento da Página !! <<
            if (!checkIfLogged) {
                connectedUsers.push(userInformation);
            }

            connectedUsersByRoom = connectedUsers.filter((element) => {
                if (element.room === room) {
                    return element;
                }
            });

            // Arrumar, NÃO está aparecendo em Tempo Real !! <<
            io.to(room).emit('connectedUser', connectedUsersByRoom);

            // Mostra TODOS os Sockets Ativos !! <<
            const activeSockets = (await io.fetchSockets()).map(socket => socket.id);
            console.log('activeSockets:', activeSockets);

            socket.emit('initialMessage', `Bem-vindo ao ChatPapo e à sala ${room} !`);

            socket.on('sendMessage', async (data: ISendMessage) => {
                // Salvando a Mensagem
                data.message = data.message;
                data.username = username;
                data.room = room;

                let saveMessage;

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