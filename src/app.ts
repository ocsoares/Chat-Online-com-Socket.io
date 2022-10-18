import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import chatRoute from './routes/chatRoute';
import { serverExpressHTTP } from './config/serverExpressHTTP';
import "./config/socket-io"; // Vai AUTOMATICAMENTE chamar e Executar o Arquivo !! <<

// OBS: Para o Docker/compose funcionar com TS e transpilar para JS, basta seguir os scripts e códigos dos Arquivos docker e MANTER RODANDO o
// script tscdir Localmente para Transpilar e o Docker detectar a mudança !! <<

// IMPORTANTE: Usei o serverExpressHTTP como listen !! <<

const server = express();

const localhost = 'http://localhost';
const PORT = 5000;

const __dirname = path.resolve();

server.set('view engine', 'ejs');

server.use(express.static(__dirname + '/src/views'));
server.use(express.static(__dirname + '/src/public'));
server.use(express.static(__dirname + '/dist'));

server.use(cors());

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(bodyParser.text({ type: 'text/json' }));

server.use(chatRoute);

serverExpressHTTP.listen(PORT, () => console.log(`Servidor rodando remotamente em ${localhost}:${PORT}`));