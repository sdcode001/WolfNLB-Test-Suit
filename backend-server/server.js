const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

const serverId = process.env.SERVER_ID || os.hostname();

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        server: serverId,
        pid: process.pid,
        time: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', server: serverId });
});

app.get('/slow', async (req, res) => {
    const delay = parseInt(req.query.delay || 3000);
    await new Promise(resolve => setTimeout(resolve, delay));
    res.json({
        server: serverId,
        type: 'slow',
        delay
    });
});

app.get('/cpu', (req, res) => {
    const start = Date.now();
    while (Date.now() - start < 3000) {} // CPU busy for 3 sec
    res.json({
        server: serverId,
        type: 'cpu'
    });
});

app.get('/crash', (req, res) => {
    res.json({ server: serverId, crashing: true });
    process.exit(1);
});

//large payload
app.get('/large', (req, res) => {
    res.send({server: serverId, data: 'x'.repeat(5 * 1024 * 1024)});
});

app.listen(PORT, () => {
    console.log(`Backend ${serverId} running on port ${PORT}`);
});

// Command to start this server app: SERVER_ID=<server id> PORT=<port number> node server.js