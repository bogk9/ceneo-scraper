const express = require("express");
const cacheManager = require('cache-manager');
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit');
const cors = require("cors");
const path = require('path');
const morgan = require('morgan')

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 50, 
	standardHeaders: true, 
	legacyHeaders: false, 
})

const app = express();

app.set('trust proxy', 1); 
app.use(bodyParser.json());
app.use(limiter);
app.use(cors())
app.use(morgan('tiny')); // logger

require('./routes/routes.js')(app);

app.listen(process.env.PORT || 8080, () => {
    console.log("Server is running!");
})

