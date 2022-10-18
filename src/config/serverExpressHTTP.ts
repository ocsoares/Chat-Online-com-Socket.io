import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

// OBS: NÃO utilizei o serverExpressHTTP em app.ts porque ele NÃO tem algumas funcionalides, como set... !! <<

const server = express();
const serverExpressHTTP = http.createServer(server); // Junta as funcionalidades do HTTP com o Express !! <<

const io = new Server(serverExpressHTTP);

export { serverExpressHTTP, io };