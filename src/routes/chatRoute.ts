import { Request, Response, Router } from 'express';
import path from 'path';
import { ChatController } from '../controllers/ChatController';

const chatRoute = Router();

const __dirname = path.resolve();

const chatEJS = path.join(__dirname, '/src/views/chat.ejs');
const indexEJS = path.join(__dirname, 'src/views/index.ejs');

const chatController = new ChatController();

chatRoute.get('/', chatController.blockIfEnterChat, (req: Request, res: Response) => {
    res.render(indexEJS);
});

chatRoute.post('/', chatController.enterChat);

chatRoute.get('/chat', chatController.checkIfEnterChat, chatController.webSocket, (req: Request, res: Response) => {
    const { username, room } = req.JWT;

    res.render(chatEJS, { username, room });
});

chatRoute.get('/logout', chatController.checkIfEnterChat, chatController.logout);

export default chatRoute;