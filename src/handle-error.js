const { NODE_ENV } = require('./config');


function handleError(error,req,res,send){
    let response;
    if (NODE_ENV === 'production') {
        response = {error: {message: 'server error!'}}
    } else {
        response = { message: error.message, error }
    }
    res.status(500).json(error)
}

module.exports = handleError;