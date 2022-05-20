const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');

const app = express();
app.use(bodyParser.json());
require('./routes/routes.js')(app);

app.listen(8080, () => {
    console.log("Server is running!");
})

