function validateBearerToken(req,res,next){
    const apiToken = process.env.API_TOKEN;
    const bearerToken = req.get('Authorization');

    if (!bearerToken || apiToken !== bearerToken.split(' ')[1]){
        return res.status(401).json({error: 'Unauthorized request!'})
    };

    next();
}

module.exports = validateBearerToken