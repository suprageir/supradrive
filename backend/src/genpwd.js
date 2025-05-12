const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const password = 'password';
const secretKey = process.env.SUPRADRIVE_SECRET_TOKENKEY;

const hashedPassword = bcrypt.hashSync(password, 16);  // Sync version
// OR use async:
// bcrypt.hash(password, 10).then(hashed => { ... });

const payload = {
  hashedPassword,
  createdAt: Date.now(),
};

const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

console.log('Password:', password);
console.log('Hashed Password:', hashedPassword);
console.log('JWT Token:', token);