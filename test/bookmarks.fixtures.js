function makeBookmarksArray(){

    const bookmarksDemo = [
        {
            id: 1,
            title: "Bible",
            url: "https://www.biblica.com/bible/",
            description: "This is a great bible.",
            rating: 5
        },
        {
            id: 2,
            title: "Cinderella",
            url: "https://princess.disney.com/cinderellas-story",
            description: "This is a Cinderella story.",
            rating: 4
        },
        {
            id: 3,
            title: "Moana",
            url: "https://princess.disney.com/moana-story",
            description: "This is a Moana story.",
            rating: 3
        }
    ]

    return bookmarksDemo;
}

function makeMaliciousBookmark(){
    const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        url: "https://princess.disney.com/sleepingbeauty-story <script>alert(\"xss\");</script>",
        rating: 5
    }

    const expectedBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        url: "https://princess.disney.com/sleepingbeauty-story &lt;script&gt;alert(\"xss\");&lt;/script&gt;",
        rating: 5
    }   

    return {
        maliciousBookmark,
        expectedBookmark,
    }
}

module.exports = { makeBookmarksArray , makeMaliciousBookmark }
