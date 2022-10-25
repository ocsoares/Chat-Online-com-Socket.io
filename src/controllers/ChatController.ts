import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
import { io } from '../config/exportServersAnd-io';
import { MessageModel } from '../models/MessageModel';
import { ISendMessage } from '../@types/interfaces';

export class ChatController {
    async enterChat(req: Request, res: Response) {
        // Fazer um JWT com NOME e ROOM, direcionar para o CHAT e BLOQUEAR essa Rota se estiver "logado" !! <<
        const { username, room } = req.body;

        try {
            const saveUser = new UserModel({ username, room });

            await saveUser.save();

            const JWT = jwt.sign({
                username,
                room
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
        const { username, room } = req.JWT;
        console.log('username:', username, 'room:', room);

        // Troquei on por once porque estava REPETINDO o socket.id VÁRIAS vezes !!
        io.once('connection', async socket => {
            console.log('socket ID:', socket.id);

            // Procurar como NÃO substituir algo no Array !! <<
            let teste_user: string[] = [];
            teste_user.push(username);
            console.log(teste_user);

            socket.emit('sendUsername', username);

            const sockets = (await io.fetchSockets()).map(socket => socket.id);
            console.log(sockets);

            // if (!username || !room) {
            //     socket.on('disconnect', data => {
            //         console.log(`Usuário ${username} acabou de sair !`);
            //     });
            // }

            socket.emit('initialMessage', `Bem-vindo ao ChatPapo e à sala ${room} !`);

            socket.join(room);

            const teste = await io.in(room).fetchSockets();

            let arroz: any[] = [];
            teste.forEach(teste => arroz.push(teste.rooms, username));

            console.log('ARROZ:', arroz);


            // for (const socket of teste) {
            //     const loggeds = socket.rooms.add({ teste: username } as unknown as string);
            //     console.log(loggeds);

            //     // const teste = Object.keys(socket.rooms);


            //     // if(loggeds){
            //     //     const teste = loggeds.next()
            //     // }
            // }

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