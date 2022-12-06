const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit');
const cors = require("cors");
const config = require('config');
const morgan = require('morgan')

const WINDOW_TIME_LIMIT = config.get('express.window_time_limit');
const WINDOW_MAX_CONN = config.get('express.window_max_conn');

const limiter = rateLimit({
	windowMs: WINDOW_TIME_LIMIT, 
	max: WINDOW_MAX_CONN, 
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

