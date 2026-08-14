import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_token_for_smart_inventory_system_123', {
    expiresIn: '30d',
  });
};

export default generateToken;
