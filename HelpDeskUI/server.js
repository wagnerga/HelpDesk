import { readFileSync, watch } from 'fs';
import { createServer } from 'https';
import express from 'express';
import next from 'next';
import dotenv from 'dotenv';
import path from 'path';

// Conditionally load the correct environment file
const envFile = process.env.NODE_ENV === 'production'
    ? '.env.production'
    : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Variables to hold key and certificate
let httpsOptions = {
    key: readFileSync(process.env.SSL_KEY_FILE),
    cert: readFileSync(process.env.SSL_CRT_FILE),
};

// Declare httpsServer in a higher scope
let httpsServer;

// Function to reload certificates
const reloadCertificates = () => {
    try {
        httpsOptions = {
            key: readFileSync(process.env.SSL_KEY_FILE),
            cert: readFileSync(process.env.SSL_CRT_FILE),
        };
        if (httpsServer) {
            httpsServer.setSecureContext(httpsOptions); // Dynamically update SSL context
            console.log('Successfully reloaded key and certificate.');
        }
    } catch (err) {
        console.error('Error reloading certificates:', err);
    }
};

// Watch for changes to certificate files
[process.env.SSL_KEY_FILE, process.env.SSL_CRT_FILE].forEach((filePath) => {
    watch(filePath, () => {
        console.log(`File changed: ${filePath}, reloading certificates...`);
        reloadCertificates();
    });
});

// Prepare Next.js app
console.log('Starting server preparation...');
app.prepare().then(() => {
    console.log('App prepared. Setting up server...');
    const server = express();

    // server.use((req, res, next) => {
    //     const malformed = /^\/(:|::|undefined|null|$)/.test(req.url);

    //     if (malformed) {
    //         console.warn('Blocked malformed URL:', req.url);
    //         return res.status(400).send('Malformed URL');
    //     }
    //     next();
    // });

    // Define Express routes
    server.all('*', async (req, res) => {
        try {
            console.log(`Handling request for ${req.url}`);
            await handle(req, res);
        } catch (err) {
            console.error('Error handling request:', err);
            res.status(400).send('Bad request');
        }
    });

    // Create an HTTPS server
    httpsServer = createServer(httpsOptions, server);

    httpsServer.listen(process.env.PORT, (err) => {
        if (err) {
            console.error('Server error:', err);
            throw err;
        } else {
            console.log(`> Ready on https://localhost:${process.env.PORT}`);
        }
    });
}).catch((err) => {
    console.error('App preparation error:', err.stack || err);
});