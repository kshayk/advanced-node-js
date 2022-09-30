const cluster = require('cluster');

console.log(cluster.isMaster);

if (cluster.isMaster) {
    const cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    return;
}

const express = require('express');
const crypto = require("crypto");
const app = express();

// function doWork(duration) {
//   const start = Date.now();
//   while (Date.now() - start < duration) {}
// }

app.get('/', (req, res) => {
    console.log("slow worker id:" + cluster.worker.id);
    // doWork(5000);
    crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
        res.send('Hello World!');
    });
});

app.get('/fast', (req, res) => {
    console.log("fast worker id:" + cluster.worker.id);
    res.send('This was fast!');
});

app.get('/fast2', (req, res) => {
    console.log("fast2 worker id:" + cluster.worker.id);
    res.send('This was fast!');
});

app.listen(3000, () => {
    console.log('app listening on port 3000!');
});