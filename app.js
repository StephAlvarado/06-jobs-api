require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const express = require('express');
const app = express();

//connectDB 
const connectDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')

//routers 
const authRouter =  require('./routes/auth')
const jobsRouter = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const { RateLimiter } = require('rate-limiter');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 min 
  max: 100, //limit each IP to 100 requests per windowMs
 })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());


app.get("/multiply", (req, res) => {
  const result = req.query.first * req.query.second;
  if (result.isNaN) {
    result = "NaN";
  } else if (result == null) {
    result = "null";
  }
  res.json({ result: result });
});

//app.get('/', (req, res) => {
 // res.send('jobs api')
//})

//app.get("/", (req, res) => {
  //res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
//});

app.use(express.static("public"));

// extra packages
app.use((req, res, next) => {
  if (req.path == "/multiply") {
    res.set("Content-Type", "application/json");
  } else {
    res.set("Content-Type", "text/html");
  }
  next();
});




// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser ,jobsRouter)


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, console.log(`Server is listening on port ${port}...`))
  } catch (error) {
    console.log(error)
  }
}

let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
  mongoURL = process.env.MONGO_URI_TEST;


const port = process.env.PORT || 3000;
const start = () => {
  try {
    require("./db/connect")(mongoURL);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
}};

start();

module.exports = { app };
