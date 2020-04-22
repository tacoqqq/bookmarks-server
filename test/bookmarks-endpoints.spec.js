const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe(`Bookmarks endpoints`, () => {
    let db

    before('create database before test', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db',db)
    })

    before('clean table beforehands', () => db('bookmarks').truncate())

    afterEach('clean the table after each test case', () => db('bookmarks').truncate())

    after('disconnect from database', () => db.destroy())

    describe(`GET /bookmarks`, () => {
        context(`given no data`, () => {
            it(`should return an empty list`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200,[])
            })
        })

        context(`given there are datas in the database`, () => {
            const allTestBookmarks = makeBookmarksArray()
    
            beforeEach('insert data', () => {
                return db('bookmarks').insert(allTestBookmarks)
            })
    
            it(`should return all bookmarks with status code 200`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .expect(200,allTestBookmarks)
            })
        })
    })

    describe(`GET /bookmarks/:bookmarkId`, () => {
        context(`given no bookmarks`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(404,'404 Not Found')
            })
        })
        context(`given there are bookmarks in the database`, () => {

            const allTestBookmarks = makeBookmarksArray()

            beforeEach('insert data', () => {
                return db('bookmarks').insert(allTestBookmarks)
            })

            it(`should reutrn matching bookmark`, () => {

            const bookmarkId = 2
            const targetBookmark = allTestBookmarks[bookmarkId - 1]

            return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,targetBookmark)
            })
        })
    })

})