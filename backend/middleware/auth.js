const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'pescarte-secret-key';

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Autenticação necessária' });
  }
};

module.exports = auth;