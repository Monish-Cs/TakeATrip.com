const path = require('path');
const express = require('express');
const morgan=require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourrouter=require('./routers/tourRouter');
const userrouter=require('./routers/userRouter');
const reviewRouter = require('./routers/reviewRouter');
const AppError = require('./utils/AppError');
const ErrorController = require('./controllers/ErrorController');


const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'))


// 1) GLOBAL MIDDLEWARES
// Serving static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname,'public')));
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


app.use((req,res,next)=>{
    console.log(req.requestTime=new Date().toISOString());
    next();
});

app.get('/',(req,res)=>{
    res.status(200).render('base',{
        tour: 'The Forest Hiker',
        user: 'Monish'
    });
});

app.get("/overview", (req,res)=>{
    res.status(200).render('overview',{
        title: 'All tours'
    });
});

app.get("/tour", (req,res)=>{
    res.status(200).render('tour',{
        title: 'The Fores Hiker Tour'
    });
});
app.use("/api/v1/tours",tourrouter);
app.use("/api/v1/users",userrouter);
app.use("/api/v1/reviews",reviewRouter);

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