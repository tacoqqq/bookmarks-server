require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config')
const bookmarksRouter = require('./bookmarks/bookmarks-router');
const validateBearerToken = require('./validate-bearer-token');
const handleError = require('./handle-error');

const app = express();

const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting))
app.use(helmet());
app.use(cors());

//validate bearer token
app.use(validateBearerToken);

//request handlers
app.get('/', (req,res) => {
    res.send('Hello, world!')
})
app.use(bookmarksRouter);

//handle error response
app.use(handleError);



module.exports = app;