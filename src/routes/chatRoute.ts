import { Request, Response, Router } from 'express';
import path from 'path';
import { ChatController } from '../controllers/ChatController';
import { MessageModel } from '../models/MessageModel';

const chatRoute = Router();

const __dirname = path.resolve();

const chatEJS = path.join(__dirname, '/src/views/chat.ejs');
const indexEJS = path.join(__dirname, 'src/views/index.ejs');

const chatController = new ChatController();

chatRoute.get('/', chatController.blockIfEnterChat, (req: Request, res: Response) => {
    res.render(indexEJS);
});

chatRoute.post('/', chatController.enterChat);

chatRoute.get('/chat', chatController.checkIfEnterChat, chatController.webSocket, async (req: Request, res: Response) => {
    const { username, room } = req.JWT;

    // Tive que usar o await assim por causa do reverse(), porque o sort retornou ordenado Errado para o meu uso do HTML !! <<
    // sort -1 = Descendente !!
    const returnMessagesRoom = (await MessageModel.find({ room }).sort({ createdAt: -1 }).limit(4)).reverse();

    res.render(chatEJS, { username, room, returnMessagesRoom });
});

chatRoute.get('/logout', chatController.checkIfEnterChat, chatController.logout);

export default chatRoute;