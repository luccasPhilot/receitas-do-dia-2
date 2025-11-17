import jwt from 'jsonwebtoken';

export const protectRoute = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;

    if (!req.user || !req.user.id) {
      throw new Error('Payload do token é inválido. Não contém user.id');
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido.', error: err.message });
  }
};