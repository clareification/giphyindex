var indico = require('indico.io');
indico.apiKey = '68cd5c1dafb61295a5f288b517bd083b';
var Firebase = require("firebase");
var q = require('q');

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
	slice.children.forEach(function(child){
		gifUrls.push(child.data.url);
		displayVariables();

		//Get text tags for each child
		indico.texttags(child.data.title).then(function(res){
		gifMeanings.push(setFeatures(res));
		});


		indico.sentiment(child.data.title)
  .then(function(res) {
    gifSentiments.push(res);
   // console.log(res);
  })
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

  	//Add url to links array
  	newsLinks.push(child.data.url);

  	//Add the topics of title to topic array
  	var currTitle = child.data.title;
  	indico.texttags(currTitle, settings)
  .then(function(res) {
  	var currArray = setFeatures(res); 	
    newsTopics.push(currArray);
  });
  	indico.sentiment(currTitle).then(function(res){
  		newsSentiments.push(res);
  	});
  });
});


console.log("difference : " + (newsSentiments[1] - gifSentiments[1]));

//More Functions

function sumSquares(a , b){
	var sum = 0;;
	for(var i = 0; i<a.length && i<b.length; i++){
		sum += Math.pow(a[i] - b[i], 2);
	}

	//for debugging
	console.log("Sum is " + sum);
	return sum;
}

 function setFeatures(res) {
  	var features = []
		for(var key in res){
			if(res.hasOwnProperty(key)){
				//console.log(res[key]);
				features.push(res[key]);
				}
			}
			//console.log(features);
	return features;
  }


function displayVariables(){
	console.log("gm : " + gifMeanings.length + " gs " + gifSentiments.length + " ns" + newsSentiments.length + "nt" + newsTopics.length);
}

//Save to firebase

var ref = new Firebase("https://giphyindex.firebaseio.com/");

var contentRef = ref.child("content");

contentRef.set({
	gif_url: ""
})