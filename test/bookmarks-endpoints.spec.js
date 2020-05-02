require('dotenv').config();
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray , makeMaliciousBookmark } = require('./bookmarks.fixtures')

describe(`Bookmarks endpoints`, () => {
    let db

    before('create database before test', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        })
        app.set('db',db)
    })

    before('clean table beforehands', () => db('bookmarks').truncate())

    afterEach('clean the table after each test case', () => db('bookmarks').truncate())

    after('disconnect from database', () => db.destroy())

    describe(`GET /api/bookmarks`, () => {
        context(`given no data`, () => {
            it(`should return an empty list`, () => {
                return supertest(app)
                    .get('/api/bookmarks')
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
                    .get('/api/bookmarks')
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .expect(200,allTestBookmarks)
            })
        })
    })

    describe(`GET /api/bookmarks/:bookmarkId`, () => {
        context(`given no bookmarks`, () => {
            it(`responds with 404`, () => {
                const bookmarkId = 123456
                return supertest(app)
                .get(`/api/bookmarks/${bookmarkId}`)
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
                .get(`/api/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200,targetBookmark)
            })
        })
    })

    describe(`POST /api/bookmarks`, () => {
        it(`creates an article, responding with 201 and the new article`, () => {

            const newBookmark = {
                title: "Aladdin",
                url: "https://princess.disney.com/aladdin-story",
                description: "This is an Aladdin story",
                rating: 5
            }

            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.rating).within(1,5).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/bookmarks/${postRes.body.id}`)
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
                    .post('/api/bookmarks')
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
                .post('/api/bookmarks')
                .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(400, 'Invalid data')
        })


        it(`removes malicious content`, () => {
            const { maliciousBookmark , expectedBookmark } = makeMaliciousBookmark();
            return supertest(app)
                .post('/api/bookmarks')
                .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                .send(maliciousBookmark)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title)
                })
        })

    })

    describe(`DELETE /api/bookmarks/:bookmarkId`, () => {
        context( `data exists in database`, () => {
            const allTestBookmarks = makeBookmarksArray();

            beforeEach(`insert datas into table`, () => {
                return db('bookmarks').insert(allTestBookmarks)
            })

            it(`should respond 204 and delete bookmark from table`, () => {
                const deletedBookmarkId = 2
                return supertest(app)
                    .delete(`/api/bookmarks/${deletedBookmarkId}`)
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(response => {
                        const newBookmarks = allTestBookmarks.filter(testBookmark => testBookmark.id !== deletedBookmarkId)
                        return supertest(app)
                            .get('/api/bookmarks')
                            .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                            .expect(200, newBookmarks)
                    })
            })
        })

        context(`data does not exist in database`, () => {
            it(`should respond 404 with an error message`, () => {
                const deletedBookmarkId = 2
                return supertest(app)
                    .delete(`/api/bookmarks/${deletedBookmarkId}`)
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .expect(404,'404 Not Found')
            })
        })
    })

    describe(`PATCH /api/bookmarks/:bookmarkId`, () => {
        context(`given there is no data`, () => {
            it(`should respond 404 with an error message`, () => {
                return supertest(app)
                    .patch('/api/bookmarks/1')
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .expect(404,'404 Not Found')
            })
        })

        context(`given there are bookmarks in the database`, () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db('bookmarks').insert(testBookmarks)
            })

            it(`should update the bookmark and respond 204`, () => {
                const testId = 2
                const updatedContent = {
                    title: 'updated title',
                    url: 'updated url', 
                    description: 'updated description',
                    rating: Math.floor(Math.random() * 5 + 1)
                }
                return supertest(app)
                    .patch(`/api/bookmarks/${testId}`)
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .send(updatedContent)
                    .expect(204)
                    .then(updateRes => {
                        const expectedBookmark = {
                            ...testBookmarks[testId - 1],
                            ...updatedContent
                        }
                        return supertest(app)
                            .get(`/api/bookmarks/${testId}`)
                            .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmark)
                    })
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const testId = 2
                return supertest(app)
                    .patch(`/api/bookmarks/${testId}`)
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .send({irrelevantField: 'irrelevantInfo'})
                    .expect(400,'Bad Request')
            })

            it(`responds with 204 when updating only a subset of field`, () => {
                const testId = 2
                const updatedContent = {
                    title: 'updated bookmark title'
                }
                const expectedBookmark = {
                    ...testBookmarks[testId - 1],
                    ...updatedContent
                }
                return supertest(app)
                    .patch(`/api/bookmarks/${testId}`)
                    .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                    .send({
                        ...updatedContent,
                        somethingElse: 'something else'
                    })
                    .expect(204)
                    .then(updateRes => {
                        return supertest(app)
                            .get(`/api/bookmarks/${testId}`)
                            .set('Authorization',`Bearer ${process.env.API_TOKEN}`)
                            .expect(200, expectedBookmark)
                    })
            })
        })
    })

})