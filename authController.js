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
      let subUsers = [];
      console.log(subordinates);
      subordinates.forEach( async (subordinate) => {
        const isUserCreated = await User.findOne({ username: subordinate });
        subUsers.push(isUserCreated._id)
        if (!isUserCreated) {
          const hashSubPassword = bcrypt.hashSync("Start123", 3);
          const subordinateUser = new User({ username: subordinate, password: hashSubPassword, roles: [{ value: "USER", boss: username }] });
          await subordinateUser.save();
        }
      });
      const hashPassword = bcrypt.hashSync(password, 3);
      const user = await User.create({ username, password: hashPassword, role: { value: "BOSS"}, subordinates: subUsers });
      
      return res.status(200).json(user);
    } catch (err) {
      console.log(err);
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

    } catch (err) {
      console.log(err);
      res.status(400).json({ message: 'login error' });
    }
  }

  async getUsers(req, res) {

    try {
      let users = [];
      const { id, roles } = req.user;
      if (roles[0].value === "ADMIN") {
        console.log('admin');
        users = await User.find();
      }
      if (roles[0].value === "BOSS") {
        users = await Promise.all(roles[0].subordinates
          .map((subordinate) => new Promise(async (resolve) => {
            const subUser = await User.findOne({ username: subordinate });
            resolve(subUser);
          })));
        const mainUser = await User.findById(id);
        users.push(mainUser);
      }
      if (roles[0].value === "USER") {
        console.log('user');
        users = await User.findById(id);
      }
      res.status(200).json({ users });
    } catch(err) {
      res.status(400).json({message: "geterror"});
    }
  }
}

module.exports = new AuthController();