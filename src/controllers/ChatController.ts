import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
import { io } from '../config/exportServersAnd-io';
import { MessageModel } from '../models/MessageModel';
import { ISendMessage, IUserInformation } from '../@types/interfaces';

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
        const { username } = req.JWT;

        try {
            await UserModel.findOneAndDelete({ username });

            res.clearCookie('chat_cookie');

            // io.on('connect', socket => {
            //     console.log(socket.id);

            //     socket.on('disconnect', data => {
            //         socket.emit('userLogout', `Usuário ${username} desconectado !`);
            //         console.log('DESCONECTADO !!');
            //     });
            // });

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
                socket_id: socket.id
            };

            socket.broadcast.to(room).emit('connectedUser', userInformation);

            socket.on('connectedUser', data => {
                console.log('connectedUser:', data);
            });

            const sockets = (await io.fetchSockets()).map(socket => socket.id);
            console.log(sockets);

            socket.on('disconnect', data => {
                console.log(`Usuário com socket '${socket.id}' foi desconectado !`);
                socket.broadcast.to(room).emit('disconnectUser', userInformation);
            });

            socket.emit('initialMessage', `Bem-vindo ao ChatPapo e à sala ${room} !`);

            const teste = await io.in(room).fetchSockets();

            let arroz: any[] = [];
            teste.forEach(teste => arroz.push(teste.rooms, username));

            console.log('ARROZ:', arroz);

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