const crypto = require('crypto');

crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
  console.log('Done');
});