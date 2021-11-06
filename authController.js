const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('./Models/User');
const Role = require('./Models/Role');
const { secret } = require('./config');

const accessToken = (id, roles) => {
  const payload = {
    id,
    roles
  }
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}
class AuthController {
  async registration(req, res) {
    try {
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(400).json({ message: "registration validation error", err });
      };

      const { username, password } = req.body;
      const doubleUser = await User.findOne({ username });

      if (doubleUser) {
        return res.status(400).json({ message: 'user already exist' });
      };

      const hashPassword = bcrypt.hashSync(password, 3);
      const userRole = new Role({ value: "USER" });
      const user = new User({ username, password: hashPassword, roles: [userRole] });

      await user.save();
      return res.status(200).json(user);
    } catch(err) {
      res.status(400).json({ message: 'registration error' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(400).json({ message: `user ${username} not found` });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'wrong password' });
      }
      const token = accessToken(user._id, user.roles);
      return res.json({ token });

    } catch(err) {
      res.status(400).json({ message: 'login error' });
    }
  }

  async getUsers(req, res) {

    try {
      const userRole = new Role();
      const adminRole = new Role({ value: 'ADMIN' });
      const bossRole = new Role({ value: 'BOSS' });

      await userRole.save();
      await adminRole.save();
      await bossRole.save();

      const users = User.find();
      
      res.status(200).json({ users });
    } catch(err) {

    }
  }
}

module.exports = new AuthController();