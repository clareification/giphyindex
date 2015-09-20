var Firebase = require("firebase");

var rootRef = new Firebase("https://giphyindex.firebaseio.com/");

rootRef.push().set({
	article_url: "nytimes.com",
	gif_url: "imgur.com",
	sentiment: .8

})