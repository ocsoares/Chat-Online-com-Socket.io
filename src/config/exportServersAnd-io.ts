import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

// Tive que EXPORTAR tudo porque algumas Funcionalidades só funcionam assim...

const server = express();
const serverExpressHTTP = http.createServer(server); // Junta as funcionalidades do HTTP com o Express !! <<

const io = new Server(serverExpressHTTP);

export { server, serverExpressHTTP, io };