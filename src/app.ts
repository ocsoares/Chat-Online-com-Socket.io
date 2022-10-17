import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const server = express();

const localhost = 'http://localhost';
const port = 5000;

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(bodyParser.text({ type: 'text/json' }));

server.use(cors());

server.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Servidor online !' });
});

server.listen(port, () => {
    console.log(`Servidor rodando remotamente em ${localhost}:${port}`);
});