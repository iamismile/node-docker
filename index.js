const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  REDIS_PORT,
  SESSION_SECRET,
} = require('./config/config');

const redisClient = redis.createClient({
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT,
  },
  legacyMode: true,
});
redisClient.connect().catch(console.error);

const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => {
      console.log('Successfully connected to DB');
    })
    .catch((e) => {
      console.error(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 3000000,
    },
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('<h2>Hi There</h2>');
});

// localhost:3000/api/v1/posts
app.use('/api/v1/posts', postRouter);
// localhost:3000/api/v1/users
app.use('/api/v1/users', userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));
