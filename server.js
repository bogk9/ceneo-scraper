const express = require("express");
//const ExpressCache = require('express-cache-middleware');
const cacheManager = require('cache-manager');
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit');
const cors = require("cors");
const path = require('path');
const morgan = require('morgan')

/*
const cacheMiddleware = new ExpressCache(
    cacheManager.caching({
        store: 'memory', max: 10000, ttl: 3600
    })
)

*/

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 50, // 50 requests per 15 min per IP
	standardHeaders: true, 
	legacyHeaders: false, 
})


const app = express();

app.set('trust proxy', 1); // !check while deploying to heroku for limiter to work properly
//cacheMiddleware.attach(app)
app.use(bodyParser.json());
app.use(limiter);
app.use(cors())
app.use(morgan('tiny')); // logger

require('./routes/routes.js')(app);

app.listen(process.env.PORT || 8080, () => {
    console.log("Server is running!");
})

