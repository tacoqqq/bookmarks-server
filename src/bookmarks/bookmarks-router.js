const express = require('express');
const { bookmarks } = require('../store');
const logger = require('../logger');
const BookmarksService = require('../bookmarks-service');
const xss = require('xss');

const bookmarksRouter = express.Router();
const parseBody = express.json();


function sanitizeContent(article){
    return {
        id: article.id,
        title: xss(article.title),
        description: xss(article.description),
        url: xss(article.url),
        rating: article.rating
    }
}


bookmarksRouter
    .route('/bookmarks')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        BookmarksService.getAllBookmarks(knexInstance)
            .then(articles => {
                res.json(articles.map(article => sanitizeContent(article)))
            })
            .catch(next)
    })
    .post(parseBody, (req,res,next) => {
        const knexInstance = req.app.get('db');
        const { title, url, description='', rating } = req.body;

        if (!title || !url || !rating || Number(rating) > 5 || Number(rating) < 0 ){
            logger.error(`Data must contain title, url and rating that falls in range 0 - 5`);
            return res.status(400).send('Invalid data');
        }

        const newBookmark = {
            title: title,
            url: url,
            description: description,
            rating: rating,
        }
        
        BookmarksService.createBookmark(knexInstance,newBookmark)
            .then(AddedBookmark => {
                logger.info(`New bookmark with id ${AddedBookmark.id} created.`);

                res
                    .status(201)
                    .location(`/bookmarks/${AddedBookmark.id}`)
                    .json(sanitizeContent(AddedBookmark))
            })
            .catch(next)
                   
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .all((req,res,next) => {
        const { id } = req.params;
        const knexInstance = req.app.get('db'); 
        
        BookmarksService.getBookmarkById(knexInstance,id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${id} is not found.`);
                    return res.status(404).send('404 Not Found')
                }
                res.bookmark = bookmark;
                next();
            })
    })
    .get((req,res) => {
        res.json(sanitizeContent(res.bookmark))
    })
    .delete((req,res,next) => {
        const { id } = req.params;
        const knexInstance = req.app.get('db')

        BookmarksService.deleteBookmark(knexInstance,id)
            .then(response => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter
    