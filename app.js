const express = require('express');
const morgan=require('morgan');
const tourrouter=require('./routers/tourRouter');
const userrouter=require('./routers/userRouter');
const AppError = require('./utils/AppError');
const ErrorController = require('./controllers/ErrorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');


const app = express();
// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'));
}
// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
      whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
      ]
    })
);

//my own middleware
app.use((req,res,next)=>{
    console.log("Hello from the middleware");
    next();
});


// Serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req,res,next)=>{
    console.log(req.requestTime=new Date().toISOString());
    next();
});
app.use("/api/v1/tours",tourrouter);
app.use("/api/v1/users",userrouter);

app.all('*',(req,res,next)=>{
    /* res.status(404).json({
        status: "Fail",
        message: ` Cannot Find ${req.originalUrl} .... Try proper url`
    });
    next(); */
/*     const err = new Error(` Cannot Find ${req.originalUrl} .... Try proper url`);
    err.statusCode = 202;
    err.status = 'Fail'; */
    next(new AppError(` Cannot Find ${req.originalUrl} .... Try proper url`,404));
});

app.use(ErrorController);

module.exports = app;