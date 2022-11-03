# **ChatPapo** - Um chat online em tempo real
[![NPM](https://img.shields.io/npm/l/react)](https://github.com/neliocursos/exemplo-readme/blob/main/LICENSE) 

# Autor

Cauã Soares

https://www.linkedin.com/in/ocauasoares/

# Sobre o projeto

## Hospedado/Deploy no Render:
https://chat-online.onrender.com <br>

**ATENÇÃO:** Caso o Deploy não tenha acesso em um determinado período de tempo, ele ficará offline até que tenha algum acesso. Então, caso o link demore a carregar, é completamente normal e basta esperar para utilizar o site.

O projeto, resumidamente, consiste em um **Chat** online em *tempo real*, com o auxílio de **sockets**.

## Características e funcionalidades do projeto:
- Implementação de sockets (cliente e servidor)
- Escolha do nome do usuário do chat
- Salas **independentes** disponíveis para diversos assuntos
- Informações de usuários conectados em uma sala
- Funcionalidade de logout
- Restrição de usuários conectados com o mesmo **nome** em uma mesma **sala**, mostrando um alerta de erro.
- Rota do chat protegida com um **middleware** de *autenticação* (só é possível acessar a rota **/chat** com um cookie autenticado (**JWT**), disponibilizado *automaticamente* após escolher um nome e uma sala).

## Vídeo demonstrativo (download GitHub)
**Link**: https://github.com/ocsoares/Chat-Online-com-Socket.io/blob/master/assets/chat-online-com-socket.mp4?raw=true

## Tela inicial
![Tela inicial](https://raw.githubusercontent.com/ocsoares/Chat-Online-com-Socket.io/master/assets/home.jpg)

## Alerta de erro de mesmos usuários conectados em uma sala
![Alerta erro usuários](https://raw.githubusercontent.com/ocsoares/Chat-Online-com-Socket.io/master/assets/alerta-erro-usuarios.jpg)

## Chat
![Chat](https://raw.githubusercontent.com/ocsoares/Chat-Online-com-Socket.io/master/assets/chat.jpg)

# Tecnologias e Bibliotecas utilizadas
## Back end
- Typescript
- Nodejs
- Express
- express-session
- Redis
- cors
- socket.io
- Atlas (MongoDB)
- JWT
- connect-flash (Alertas)
- connect-mongo

## Front end
- HTML (EJS)
- CSS
- Javascript

# Como executar o projeto **Localmente**

Pré-requisitos: Javascript/Typescript, NodeJS, Express

```bash
# clonar o repositório
git clone https://github.com/ocsoares/CRUD-Web-Blog

# instalar as bibliotecas
npm install

# configurar o banco de dados (mongoose) com as suas credenciais
cd src/database
configurar o arquivo mongoose.ts

# após configurado, transformar para .js
npm run build

# executar o projeto
npm start
```