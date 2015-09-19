var indico = require('indico.io');
indico.apiKey = '68cd5c1dafb61295a5f288b517bd083b';

settings = {"api_key": "68cd5c1dafb61295a5f288b517bd083b"};

indico.sentiment("This is a decent example")
  .then(function(res) {
    //console.log(res);
  }).catch(function(err) {
    console.warn(err);
  });

// {u'Sentiment': 0.6072520629364269}


//Set up reddit api wrapper

var Snoocore = require("snoocore");

var reddit = new Snoocore({
  // Unique string identifying the app
  userAgent: '/u/username myApp@3.0.0',
  // It's possible to adjust throttle less than 1 request per second.
  // Snoocore will honor rate limits if reached.
  throttle: 300,
  oauth: {
    type: 'implicit',
    key: '_sty7RuHMXLIfA',
    redirectUri: 'http://localhost:3000',
    // The OAuth scopes that we need to make the calls that we
    // want. The reddit documentation will specify which scope
    // is needed for evey call
    scope: [ 'identity', 'read', 'vote' ]
  }
});



//Initialize GIF variables

var gifUrls = [];
var gifMeanings = [];
var bestGifIndex = 0;
var gifSentiments= [];

//Put cat gifs in an array
reddit('/r/catgifs/hot').listing().then(function(slice){
	console.log("test");
	slice.children.forEach(function(child){
		gifUrls.push(child.data.url);
		indico.sentiment(child.data.title)
  .then(function(res) {
    gifMeanings.push(res);
    console.log(res);
  }).catch(function(err) {
    console.warn(err);
  });
	})
	console.log("Gif Urls: ");
	console.log("Gifs " + gifUrls);
		});


//Put news articles in Array

//Array of URLs
var newsLinks = [];

//Array of topics (each topic is a 111-dimensional vector)
var newsTopics = [];

//Array of sentiment analysis values (each between 0 and 1)
var newsSentiments = [];

//index of current news article
var newsIndex = 0;

//Get news data from reddit
reddit('/r/news/hot').listing().then(function(slice) {

  slice.children.forEach(function(child){
  	newsLinks.push(child.data.url);
  	var currTitle = child.data.title;
  	indico.texttags(currTitle, settings)
  .then(function(res) {
  	var currArray = [];
  	currArray.setFeatures(res);
    newsTopics.push(currArray);
    console.log("News Topics \n" + newsTopics);
  }).catch(function(err) {
    console.warn(err);
  })
  .then(function() {
  	indico.sentiment(currTitle).then(function(res){
  		newsSentiments.push(res);
  		console.log("Sentiments \n" + newsSentiments);
  	});
  	}
  );

  });
  
  // Get a promise for the next slice in this 
  // listing (the next page!)

  
});

//More Functions

function sumFunction(a, b){
	var c = [];
	for(var i = 0; i<a.length && i<b.length; i++){
		c[i] = Math.pow(a[i] - b[i], 2);
	}
	var sum = 0;
	for(var j = 0; j<c.length; j++){
		sum += c[i];
	}
	return sum;
}

  function setFeatures(str) {
  	var features = [];
  		indico.texttags(str, settings)
  		.then(function(res) {
  				for(var key in res){
  					if(res.hasOwnProperty(key)){
  						features.push(res[key]);
  					}
  				}
  		})
  		return features;
  }



