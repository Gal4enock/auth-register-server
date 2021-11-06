const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('./Models/User');
const { secret } = require('./config');

const accessToken = (id, roles) => {
  const payload = {
    id,
    roles
  }
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}
class AuthController {
  async registrationAdmin(req, res) {
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
      const user = new User({ username, password: hashPassword, roles: [{ value: "ADMIN" }] });

      await user.save();
      return res.status(200).json(user);
    } catch(err) {
      res.status(400).json({ message: 'registration error' });
    }
  }

    async registrationUser(req, res) {
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
      const user = new User({ username, password: hashPassword, roles: [{ value: "USER" }] });

      await user.save();
      return res.status(200).json(user);
    } catch(err) {
      res.status(400).json({ message: 'registration error' });
    }
  }

    async registrationBoss(req, res) {
    try {
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(400).json({ message: "registration validation error", err });
      };

      const { username, password, subordinates } = req.body;
      const doubleUser = await User.findOne({ username });

      if (doubleUser) {
        return res.status(400).json({ message: 'user already exist' });
      };
      subordinates.forEach( async (subordinate) => {
        const isUserCreated = await User.findOne({ username: subordinate });
        if (!isUserCreated) {
          const hashSubPassword = bcrypt.hashSync("Start123", 3);
          const subordinateUser = new User({ username: subordinate, password: hashSubPassword, roles: [{ value: "USER", boss: username }] });
          await subordinateUser.save();
        }
      });
      const hashPassword = bcrypt.hashSync(password, 3);
      const user = await User.create({ username, password: hashPassword, roles: [{ value: "BOSS", subordinates }] });

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
      const { id, roles } = req.user;
      let users = [];

      if (roles.value === "ADMIN") {
        users = await User.find();
      }
      if (roles.value === "BOSS") {
        const mainUser = await User.findById(id);
        users.push(mainUser);
        roles.subordinates.forEach(async (subordinate) => {
          subUser = await User.findOne({ username: subordinate });
          users.push(subUser)
        })
      } else {
        users = await User.findById(id);
      }
      console.log(users);
      
      res.status(200).json({ users });
    } catch(err) {

    }
  }
}

module.exports = new AuthController();