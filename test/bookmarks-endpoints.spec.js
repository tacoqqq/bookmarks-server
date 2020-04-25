const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray , makeMaliciousBookmark } = require('./bookmarks.fixtures')

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

    describe(`POST /bookmarks`, () => {
        it(`creates an article, responding with 201 and the new article`, () => {

            const newBookmark = {
                title: "Aladdin",
                url: "https://princess.disney.com/aladdin-story",
                description: "This is an Aladdin story",
                rating: 5
            }

            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.rating).within(1,5).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                        .expect(postRes.body)
                )
        })


        const requiredFields = ['title','url','rating']

        const newBookmark = {
            title: "Aladdin",
            url: "https://princess.disney.com/aladdin-story",
            description: "This is an Aladdin story",
            rating: 5
        }

        requiredFields.forEach(field => {
            delete newBookmark[field]

            it(`should respond 400 with error message when ${field} is missing`, () => {
                return supertest(app)
                    .post('/bookmarks')
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(400,'Invalid data')
            })
        })


        it(`should respond 400 when rating doesn't fall in the range 0-5`, () => {
            const newBookmark = {
                title: "Aladdin",
                url: "https://princess.disney.com/aladdin-story",
                description: "This is an Aladdin story",
                rating: 9
            }
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(400, 'Invalid data')
        })


        it(`removes malicious content`, () => {
            const { maliciousBookmark , expectedBookmark } = makeMaliciousBookmark();
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                .send(maliciousBookmark)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title)
                })
        })

    })

    describe(`DELETE /bookmarks/:bookmarkId`, () => {
        context( `data exists in database`, () => {
            const allTestBookmarks = makeBookmarksArray();

            beforeEach(`insert datas into table`, () => {
                return db('bookmarks').insert(allTestBookmarks)
            })

            it(`should respond 204 and delete bookmark from table`, () => {
                const deletedBookmarkId = 2
                return supertest(app)
                    .delete(`/bookmarks/${deletedBookmarkId}`)
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(response => {
                        const newBookmarks = allTestBookmarks.filter(testBookmark => testBookmark.id !== deletedBookmarkId)
                        return supertest(app)
                            .get('/bookmarks')
                            .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                            .expect(200, newBookmarks)
                    })
            })
        })

        context(`data does not exist in database`, () => {
            it(`should respond 404 with an error message`, () => {
                const deletedBookmarkId = 2
                return supertest(app)
                    .delete(`/bookmarks/${deletedBookmarkId}`)
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .expect(404,'404 Not Found')
            })
        })
    })

})