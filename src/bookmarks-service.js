const BookmarksService = {
    getAllBookmarks(knex){
        return knex
            .select('*')
            .from('bookmarks')      
    },

    getBookmarkById(knex,id){
        return knex
            .select('*')
            .from('bookmarks')
            .where('id',id)
            .first()
    },

    createBookmark(knex,bookmark){
        return knex('bookmarks')
            .insert(bookmark)
            .returning('*')
            .then(bookmarks => {
                return bookmarks[0]
            })
    },

    updateBookmark(knex,id,newBookmarkInfo){
        return knex('bookmarks')
            .where('id',id)
            .update(newBookmarkInfo)
    },

    deleteBookmark(knex,id){
        return knex('bookmarks')
            .where('id',id)
            .delete()
    }
}

module.exports = BookmarksService