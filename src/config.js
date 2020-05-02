module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgres://ydczvbazyjnjtc:8a6472260e0b46ca9b4fe4915f9359e816b8eb4351e865bef754e228dbb5b071@ec2-18-215-99-63.compute-1.amazonaws.com:5432/d8ha9lbnnokpjk',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://daphnefang@localhost/bookmarks-test'
}