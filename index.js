const cors = require('cors');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;
const port = 7000;
//Angelópolis
// Creamos el servidor de sockets y lo incorporamos al servidor de la aplicación
const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

app.set("port", port);
app.use(cors());
app.use(express.json());

const prints = [];

wsServer.on("request", (request) =>{
    const connection = request.accept(null, request.origin);
    console.log(wsServer.connections.length);
    connection.on("message", (message) => {
        const jsonData = JSON.parse(message.utf8Data);

        if (jsonData.acction === 'suscribe') {
            prints.push({key: request.key, sucursal: jsonData.sucursal, socket: connection});
        }
        else if (jsonData.acction === 'emit') {
            prints.forEach(element => {
                if (element.sucursal === jsonData.sucursal) {
                    const jsonStr = JSON.stringify(jsonData.data);
                    element.socket.sendUTF(jsonStr);
                }
            });
        }
    });
    connection.on("close", (reasonCode, description) => {
        console.log("El cliente se desconecto");
    });
});

server.listen(app.get('port'), () =>{
    console.log('Servidor iniciado en el puerto: ' + app.get('port'));
})