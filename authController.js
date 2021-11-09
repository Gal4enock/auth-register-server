const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('./Models/User');
const { secret } = require('./config');
const HttpCodes = require('./assets/constants');

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
        return res.status(HttpCodes.BAD_REQUEST).json({ message: "registration validation error", err });
      };

      const { username, password } = req.body;
      const doubleUser = await User.findOne({ username });

      if (doubleUser) {
        return res.status(HttpCodes.BAD_REQUEST).json({ message: 'user already exist' });
      };

      const hashPassword = bcrypt.hashSync(password, 3);
      const user = new User({ username, password: hashPassword, roles: { value: "ADMIN" } });

      await user.save();
      return res.status(HttpCodes.CREATED).json(user);
    } catch(err) {
      res.status(HttpCodes.BAD_REQUEST).json({ message: 'registration error' });
    }
  }

    async registrationUser(req, res) {
    try {
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(HttpCodes.BAD_REQUEST).json({ message: "registration validation error", err });
      };

      const { username, password, bossName } = req.body;
      const doubleUser = await User.findOne({ username });
      const boss = await User.findOne({ username: bossName });
      if (doubleUser) {
        return res.status(HttpCodes.BAD_REQUEST).json({ message: 'user already exist' });
      };
      if (!boss) {
        return res.status(HttpCodes.BAD_REQUEST).json({message: `Sorry, but ${bossName} is not registrated yet`})
      }

      const hashPassword = bcrypt.hashSync(password, 3);
      const user = new User({
        username, password: hashPassword, roles: {
          value: "USER", boss: bossName
        }
      });

      await user.save();
      return res.status(HttpCodes.CREATED).json(user);
    } catch(err) {
      res.status(HttpCodes.BAD_REQUEST).json({ message: 'registration error' });
    }
  }

    async registrationBoss(req, res) {
    try {
      const err = validationResult(req);

      if (!err.isEmpty()) {
        return res.status(HttpCodes.BAD_REQUEST).json({ message: "registration validation error", err });
      };

      const { username, password, subordinates } = req.body;
      const doubleUser = await User.findOne({ username });

      if (doubleUser) {
        return res.status(HttpCodes.BAD_REQUEST).json({ message: 'user already exist' });
      };
        subordinates.forEach( async (subordinate) => {
          const isUserCreated = await User.findOne({ username: subordinate });
        if (!isUserCreated) {
          const hashSubPassword = bcrypt.hashSync("Start123", 3);
          const subordinateUser = new User({ username: subordinate, password: hashSubPassword, roles: { value: "USER", boss: username } });
          await subordinateUser.save();
        }
      });
      const hashPassword = bcrypt.hashSync(password, 3);
      const user = await User.create({ username, password: hashPassword, roles: { value: "BOSS", subordinates } });

      return res.status(HttpCodes.CREATED).json(user);
    } catch (err) {
      console.log(err);
      res.status(HttpCodes.BAD_REQUEST).json({ message: 'registration error' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(HttpCodes.BAD_REQUEST).json({ message: `user ${username} not found` });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(HttpCodes.NOT_AUTORIZED).json({ message: 'wrong password' });
      }
      const token = accessToken(user._id, user.roles);
      return res.status(HttpCodes.OK).json({ token });

    } catch (err) {
      console.log(err);
      res.status(HttpCodes.BAD_REQUEST).json({ message: 'login error' });
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
        users = await Promise.all(roles.subordinates
          .map((subordinate) => new Promise(async (resolve) => {
            const subUser = await User.findOne({ username: subordinate });
            resolve(subUser);
          })));
        const mainUser = await User.findById(id);
        users.push(mainUser);
      }
      if (roles.value === "USER") {
        users = await User.findById(id);
      }
      res.status(HttpCodes.OK).json({ users });
    } catch(err) {
      res.status(HttpCodes.BAD_REQUEST).json({message: "You can't get information for now"});
    }
  }

  async changeBoss(req, res) {
    try {
      const { nameBoss, nameSubUser } = req.body;
      const { id, roles } = req.user;
      const newBoss = await User.findOne({ username: nameBoss });
      const subUser = await User.findOne({ username: nameSubUser });
      if (!newBoss || !subUser) {
        return res.status(HttpCodes.BAD_REQUEST).json({
          message: `${newBoss ? nameSubUser : nameBoss} is not registrated yet`
        })
      }
      if (!roles.subordinates.includes(nameSubUser)) {
        return res.status(HttpCodes.BAD_REQUEST).json({message: `Sorry, but ${nameSubUser} is not your subordinate`});
      }
      const index = roles.subordinates.indexOf(nameSubUser);
      const subArr = roles.subordinates;
      subArr.splice(index, 1);
      const boss = await User.findByIdAndUpdate(id,
        {
          $set: {
            roles: {
              value: "BOSS", subordinates: subArr
            }
          }
        },
        { new: true },
      );
      const newSubUser = await User.findByIdAndUpdate(id,
        {
          $set: {
            roles: {
              value: "USER",
              boss: nameBoss
            }
          }
        },
        { new: true },
      );
      const newBossSubArr = newBoss.roles.subordinates.push(nameSubUser);
      const newSubBoss = await User.findByIdAndUpdate(newBoss._id,
        {
          $set: {
            roles: {
            value: "BOSS", subordinates: newBossSubArr
          }
        }
      })
      res.status(HttpCodes.OK).json({ boss, newSubUser, newSubBoss});
    } catch (err) {
      res.status(HttpCodes.BAD_REQUEST).json({ message: "Something went wrong" });
    }
  }
}

module.exports = new AuthController();
