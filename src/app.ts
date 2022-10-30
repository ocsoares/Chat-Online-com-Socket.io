import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import chatRoute from './routes/chatRoute';
import { server, serverExpressHTTP } from './config/exportServersAnd-io';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { connectionAtlas } from './database/mongoose';
import connectFlash from 'connect-flash';
import { Request, Response, NextFunction } from 'express';
import MongoStore from 'connect-mongo';

// OBS: Para o Docker/compose funcionar com TS e transpilar para JS, basta seguir os scripts e códigos dos Arquivos docker e MANTER RODANDO o
// script tscdir Localmente para Transpilar e o Docker detectar a mudança !! <<

// IMPORTANTE: Usei o serverExpressHTTP como listen !! <<

// >>IMPORTANTE: No .env estava dando ERRO porque possui Variáveis com vários $$, então corrigi colocando as Variáveis entre '' !! <<

const localhost = 'http://localhost';
const PORT = 5000;

const __dirname = path.resolve();

server.set('view engine', 'ejs');

server.use(express.static(__dirname + '/src/views'));
server.use(express.static(__dirname + '/src/public'));
server.use(express.static(__dirname + '/dist'));
server.use(express.static(__dirname + '/assets'));

server.use(cors());

server.use(cookieParser(process.env.COOKIE_SECRET));

server.use(session({
    name: 'chat_app',
    store: MongoStore.create({ mongoUrl: process.env.ATLAS_URL }),
    secret: process.env.COOKIE_SECRET as string,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true
    }
}));

server.use(connectFlash());

server.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.successFlash = req.flash('successFlash');
    res.locals.errorFlash = req.flash('errorFlash');

    next();
});

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(bodyParser.text({ type: 'text/json' }));

server.use(chatRoute);

serverExpressHTTP.listen(PORT, async () => {
    await connectionAtlas();

    console.log(`Servidor rodando remotamente em ${localhost}:${PORT}`);
});