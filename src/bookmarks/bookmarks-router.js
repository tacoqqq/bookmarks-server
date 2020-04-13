const express = require('express');
const { bookmarks } = require('../store');
const logger = require('../logger');
const { v4: uuidv4 } = require('uuid');

const bookmarksRouter = express.Router();
const parseBody = express.json();

bookmarksRouter
    .route('/bookmarks')
    .get((req,res) => {
        res.json(bookmarks)
    })
    .post(parseBody, (req,res) => {
        const { title, url, description='', rating } = req.body;
        console.log(req.body);
        if (!title || !url || !rating ){
            logger.error(`Data must contain title, url and rating`);
            return res.status(400).send('Invalid data');
        }
    
        const newBookmarkId = uuidv4();
        const newBookmark = {
            id: newBookmarkId,
            title: title,
            url: url,
            description: description,
            rating: rating,
        }
    
        bookmarks.push(newBookmark);
        console.log(newBookmark)
        
        logger.info(`New bookmark with id ${newBookmarkId} created.`);
    
        res.status(201).location(`http://localhost:8000/bookmarks/${newBookmarkId}`).json(newBookmark)
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req,res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(bookmark => bookmark.id == id);
    
        if (!bookmark) {
            logger.error(`Bookmark with id ${id} is not found.`);
            return res.status(404).send('404 Not Found');
        }
        res.json(bookmark);
    })
    .delete((req,res) => {
        const { id } = req.params;
        const bookmarkId = bookmarks.findIndex(bookmark => bookmark.id == id);
    
        if (bookmarkId === -1){
            logger.error(`Bookmark with id ${id} not found`);
            return res.status(400).send('Invalid request');
        }
    
        bookmarks.splice(bookmarkId,1);
    
        logger.info(`Bookmark with id ${id} deleted.`);
    
        res.status(204).end();
    })

module.exports = bookmarksRouter
    