const express = require('express');
const crypto = require("crypto");
const app = express();

// function doWork(duration) {
//   const start = Date.now();
//   while (Date.now() - start < duration) {}
// }

app.get('/', (req, res) => {
    // doWork(5000);
    crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
        res.send('Hello World!');
    });
});

app.get('/fast', (req, res) => {
    res.send('This was fast!');
});

app.get('/fast2', (req, res) => {
    res.send('This was fast!');
});

app.listen(3000, () => {
    console.log('app listening on port 3000!');
});