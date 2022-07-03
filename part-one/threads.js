process.env.UV_THREADPOOL_SIZE = 6;

const crypto = require('crypto');

console.time('pbkdf2 1');
console.time('pbkdf2 2');
console.time('pbkdf2 3');
console.time('pbkdf2 4');
console.time('pbkdf2 5');

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.timeEnd('pbkdf2 1');
});

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.timeEnd('pbkdf2 2');
});

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.timeEnd('pbkdf2 3');
});

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.timeEnd('pbkdf2 4');
});

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
    console.timeEnd('pbkdf2 5');
});
