const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');

const PORT = process.env.PORT || 3000;
const URL = 'mongodb+srv://gaga:gaga123@cluster0.54q8g.mongodb.net/auth_roles?retryWrites=true&w=majority';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

const start = async () => {
  try {
    await mongoose.connect(URL)
    app.listen(PORT,
      () => console.log(`server is listening on port ${PORT}`))
  } catch (e) {
    console.log(e);
  }
}

start();