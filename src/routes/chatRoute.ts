import { Request, Response, Router } from 'express';
import path from 'path';

const chatRoute = Router();

const __dirname = path.resolve();

const chatEJS = path.join(__dirname, '/src/views/chat.ejs');
const indexEJS = path.join(__dirname, 'src/views/index.ejs');

chatRoute.get('/', (req: Request, res: Response) => {
    res.render(indexEJS);
});

chatRoute.post('/', (req: Request, res: Response) => {
});

chatRoute.get('/chat', (req: Request, res: Response) => {
    res.render(chatEJS);
});

export default chatRoute;