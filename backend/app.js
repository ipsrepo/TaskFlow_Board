const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const monogoSanitize = require('express-mongo-sanitize');
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const projectRouter = require('./routes/projectRoutes');
const taskRouter = require('./routes/taskRoutes');
const AppError = require("./utils/appError");
const genericErrorHandler = require('./controllers/errorController');

const app = express();

// MiddleWare
// Set Security HTTP Middleware
app.use(helmet()); // It'll produce middleware function and add it to here

app.use(morgan('dev'));

// Handle CORS error
app.use(cors());

// Rate Limiter
const limiter = rateLimit({
    max: 3,
    windowMs: 60 * 60 * 1000,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            status: 'failed',
            message: 'Too many requests from this IP. Please try again later.',
        });
    },
});
// app.use('/api', limiter); // For all API call
app.use('/api/v1/users/login', limiter); // For login only

// Body parser, reading data from body into req.body
app.use(
    express.json({
      limit: '10kb', // Read only if body content in less than 10kb
    }),
);

// Data Sanitization against NoSQL query injection
// Prevent attack my filter req body by remove $ signs
app.use(monogoSanitize());


// Setting static file path
app.use(express.static(`${__dirname}/public`));

// Testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);

app.get('/', (req, res) => {
  res.send('Server running');
});

// Handle all the unhandled Routes
app.all('/{*any}', (req, res, next) => {
  next(
      new AppError(`Unable to find the ${req.originalUrl} in the server!!!`, 404),
  );
});

app.use(genericErrorHandler);

module.exports = app;
