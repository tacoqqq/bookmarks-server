const app = require('./app')
const { PORT } = require('./config')
const knex = require('knex')

const db = knex({
    client: 'pg',
    connection: process.env.DB_URL
})

app.set('db',db)

app.listen(PORT, () => {
    console.log(`Server listening to http://localhost:${PORT}`)
})