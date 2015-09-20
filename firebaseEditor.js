var Firebase = require("firebase");

var rootRef = new Firebase("https://giphyindex.firebaseio.com/");
var scienceRef = rootRef.child("world_articles");
scienceRef.remove();

var test = new Array();
console.log(test.length);