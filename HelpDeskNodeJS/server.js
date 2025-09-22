import https from 'https';
import express from 'express';
import next from 'next';
import { Server as SocketIO } from 'socket.io';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import { readFileSync, watch } from 'fs';
import dotenv from 'dotenv';
import process from 'process';
import { createPublicKey } from 'crypto';
import path from 'path';

dotenv.config(); // Load environment variables

// Conditionally load the correct environment file
const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const dbName = 'HelpDesk';
const port = 7002; // Default port
const username = 'hdadmin';

const password = encodeURIComponent(process.env.HDADMINPASSWORD)
    .replace('(', '%28')
    .replace(')', '%29')
    .replace('*', '%2A')
    .replace('\'', '%27')
    .replace('!', '%21')
    .replace('~', '%7E');
const conString = `postgres://${username}:${password}@127.0.0.1/${dbName}`;

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let httpsOptions = {
    key: readFileSync(process.env.SSL_KEY_FILE),
    cert: readFileSync(process.env.SSL_CRT_FILE),
};

let httpsServer;

const reloadCertificates = () => {
    try {
        httpsOptions = {
            key: readFileSync(process.env.SSL_KEY_FILE),
            cert: readFileSync(process.env.SSL_CRT_FILE),
        };
        httpsServer.setSecureContext(httpsOptions); // Dynamically update SSL context
        console.log('Successfully reloaded key and certificate.');
    } catch (err) {
        console.error('Error reloading certificates:', err);
    }
};

// Watch for changes to the certificate files
[process.env.SSL_KEY_FILE, process.env.SSL_CRT_FILE].forEach(x => {
    watch(x, () => {
        console.log('Key file changed, reloading...');
        reloadCertificates();
    });
});

(async () => {
    try {
        console.log('Starting server preparation...');
        await app.prepare();
        console.log('App prepared. Setting up server...');

        const server = express();
        server.all('*', (req, res) => handle(req, res));

        httpsServer = https.createServer(httpsOptions, server);
        const io = new SocketIO(httpsServer, {
            cors: {
                origin: ['https://localhost:7000', `https://helpdesk.com`],
                methods: ['GET', 'POST']
            }
        });

        let socketConnections = [];

        const jwtMiddleware = (socket, next) => {
            const { token } = socket.handshake.query;

            const verifyOptions = {
                issuer: 'https://helpdesk.com',
                audience: 'https://helpdesk.com',
                algorithms: ['RS256', 'RS384', 'RS512']
            };

            try {
                const derBuffer = readFileSync(process.env.NEXT_JWT_PUBLIC_KEY_PATH);

                const publicKeyObject = createPublicKey({
                    key: derBuffer,
                    format: 'der',
                    type: 'spki'
                });

                const pemPublicKey = publicKeyObject.export({ format: 'pem', type: 'spki' });
                jwt.verify(token, pemPublicKey, verifyOptions);
                console.log(`Authorized socket ${socket.id}`);

                if (!socketConnections.find(x => x.socketId === socket.id)) {
                    socketConnections.push({ socketId: socket.id });
                }

                next();
            } catch (error) {
                socketConnections = socketConnections.filter(x => x.socketId !== socket.id);
                console.log('Not authorized');
                next(new Error('not authorized'));
            }
        };

        io.use(jwtMiddleware);

        io.on('connection', socket => {
            console.log(`Connected socket ${socket.id}`);

            socket.emit('connected', { connected: true });

            socket.on('disconnect', () => {
                console.log(`Disconnecting socket ${socket.id}`);
                socketConnections = socketConnections.filter(x => x.socketId !== socket.id);
            });

            socket.on('ready_for_data', () => {
                console.log('Ready for data');
            });
        });

        httpsServer.listen(port, err => {
            if (err) throw err;
            console.log(`> Ready on https://localhost:${port}`);
        });

        const pgClientListenDeleteTicket = new pg.Client(conString);

        pgClientListenDeleteTicket.connect();
        pgClientListenDeleteTicket.query('LISTEN delete_ticket');

        const pgClientListenDeleteUser = new pg.Client(conString);

        pgClientListenDeleteUser.connect();
        pgClientListenDeleteUser.query('LISTEN delete_user');

        const pgClientListenUpdateTicket = new pg.Client(conString);

        pgClientListenUpdateTicket.connect();
        pgClientListenUpdateTicket.query('LISTEN update_ticket');

        const pgClientListenUpdateUser = new pg.Client(conString);

        pgClientListenUpdateUser.connect();
        pgClientListenUpdateUser.query('LISTEN update_user');

        pgClientListenDeleteTicket.on('notification', (msg) => {
            emit('delete_ticket', msg);
        });

        pgClientListenDeleteUser.on('notification', (msg) => {
            emit('delete_user', msg);
        });

        pgClientListenUpdateTicket.on('notification', (msg) => {
            emit('update_ticket', msg);
        });

        pgClientListenUpdateUser.on('notification', (msg) => {
            emit('update_user', msg);
        });

        const emit = (emit, msg) => {
            socketConnections.forEach(x => {
                io.to(x.socketId).emit(`${emit}`, { msg });
            });
        };
    } catch (error) {
        console.error('Error setting up server:', error);
    }
})();