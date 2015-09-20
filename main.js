var indico = require('indico.io');
indico.apiKey = '68cd5c1dafb61295a5f288b517bd083b';
var Firebase = require("firebase");
var q = require('q');

settings = {"api_key": "68cd5c1dafb61295a5f288b517bd083b"};

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

//Save data to firebase

var rootRef = new Firebase("https://giphyindex.firebaseio.com/");
var articleRef = rootRef.child("world_articles");
var newRefs=new Array();

//Initialize GIF variables

var gifUrls = new Array();
var gifMeanings = new Array();
var bestGifIndex = 0;
var gifSentiments= new Array();
var bothdone = [0, 0, 0, 0];
var gifForArticle = new Array();

//Array that contains the indices of each gif that maps to each article.
// where index = article number, value = gif_index

var gifArticleMapping = new Array();

//Put cat gifs in an array
reddit('/r/catgifs/hot').listing().then(function(slice){
	slice.children.forEach(function(child){

		var pat = "gifv";
		var pat1 = "gif";
		var currUrl = child.data.url;
		var ind = currUrl.indexOf(pat);
		if(ind != -1){
			currUrl = currUrl.replace("gifv", "gif");
		}
		gifUrls.push(currUrl);
		//Get text tags for each child
		indico.texttags(child.data.title).then(function(res){
		var currArray = setFeatures(res);
		gifMeanings.push(currArray);
		if(gifMeanings.length == 25){
			bothdone[3] = 1;
		}
		});


		indico.sentiment(child.data.title).then(function(res) {
    gifSentiments.push(res);
    if(gifSentiments.length>=25){
			bothdone[0] = 1;
		}

	if(bothdone[0]==1 && bothdone[1]==1 &&bothdone[2]==1){
		//console.log(newsSentiments);
		for(var sent = 0; sent<12; sent++){
			gifArticleMapping.push(findBestestIndex(sent, gifSentiments));	
			var newArticleRef = articleRef.push();
			newArticleRef.set({
			article_url: newsLinks[sent],	
			gif_url: gifUrls[gifArticleMapping[sent]],
			sentiment: newsSentiments[sent],
			article_title: newsTitles[sent]
				});
			console.log(gifArticleMapping);
	}
		//console.log(gifArticleMapping);

	}
   // console.log(res);
  });
});
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
var newsIndices = [];

var subredd = '/r/worldnews/hot';
var newsTitles = [];

//Get news data from reddit
reddit(subredd).listing().then(function(slice) {
  slice.children.forEach(function(child){

  	//Add url to links array
  	newsLinks.push(child.data.url);
  	if(newsLinks.length >= 25){
  		bothdone[2] = 1;
  	}
  	//Add the topics of title to topic array
  	var currTitle = child.data.title;
  	newsTitles.push(currTitle);
  	indico.texttags(currTitle, settings)
  .then(function(res) {
  	var currArray = setFeatures(res); 	
    newsTopics.push(currArray);
    //console.log(newsTopics);
  });

  	indico.sentiment(currTitle).then(function(res){
  		newsSentiments.push(res);
  		if(newsSentiments.length>=25){
  			bothdone[1] = 1;
  		}
  		if(bothdone[1]==1 && bothdone[0] ==1 && bothdone[2] == 1) {
		for(var sent = 0; sent<12; sent++){
				gifArticleMapping.push(findBestestIndex(sent, gifSentiments));	
			var newArticleRef = articleRef.push();
			newArticleRef.set({
			article_url: newsLinks[sent],	
			gif_url: gifUrls[gifArticleMapping[sent]],
			sentiment: newsSentiments[sent],
			article_title: newsTitles[sent]
				});	
			console.log(gifArticleMapping);
  		}
  	}

  	  });
  });
});


//More Functions

function sumSquares(){

	var sum = 0;
	for(var i = 0; i<a.length && i<b.length; i++){
		sum += Math.pow(a[i] - b[i], 2);
	}
	//for debugging
	return sum;
}




function findBestIndex(article, gifs){
	var bestIndex = 0;

	//All sentiments between 0 and 1 so (x-y) < 1
	var bestDifference = 1;
	for(var idx in gifSentiments){
		if(Math.abs(article - gifs[idx]) < bestDifference){
			bestDifference = Math.abs(article - gifs[idx]);		
			bestIndex = idx;
		}
	}
	//console.log("Best index : " + bestIndex + "values : " + article + " and " + gifs[bestIndex]);
	return bestIndex;
}

function findBestestIndex(articleIndex, gifs){
	//console.log(newsTopics[0]);
	var bestIndex = 0;
	var bestDiff = 1000;
	var sentimentDiffs = new Array();
	var topicDiffs = new Array();
	var weightedDiffs = new Array();
	for(var idx = 0; idx< 25; idx++){
		sentimentDiffs.push(Math.abs(newsSentiments[articleIndex]- gifs[idx]));
		//console.log("news : " + newsSentiments[articleIndex]);
		//console.log("Gifs: " + gifs[idx]);
		//console.log(Math.abs(newsSentiments[articleIndex]- gifs[idx]));
	}

	for(var indx=0; indx<25; indx++){
		var result = 0;
		for(var key in newsTopics){
			var nt = newsTopics[articleIndex][key];
			var gt = gifMeanings[indx][key];
			result += Math.pow((nt - gt), 2);
		}
		topicDiffs.push(result);
		//console.log("result : " + result);
	}
	console.log("\n");
	for(var i in sentimentDiffs){
		//console.log(sentimentDiffs);
		weightedDiffs[i] = 1.5*topicDiffs[i] + .5*sentimentDiffs[i];
		//console.log(topicDiffs.length);
		//console.log("weighted differences " + 0.2*weightedDiffs[i]);
	}

	bestIndex = 0;
	bestDiff = 1000;
	for(var j=0; j<24; j++){
		var jinMap = false;
		for(var member in gifArticleMapping){
			if (j == gifArticleMapping[member]){
				jinMap = true;
			}
		}
		var currDiff = weightedDiffs[j];
		if(currDiff<bestDiff && !jinMap){
			bestIndex = j;
			bestDiff = currDiff;
		}
		//console.log("best index: " + bestIndex);
	}
	return bestIndex;
	//console.log(bestIndex);
}

//Create the feature set as a vector
 function setFeatures(res) {
  	var features = new Array();
		for(var key in res){
			if(res.hasOwnProperty(key)){
				//console.log(res[key]);
				features.push(res[key]);
				}
			}
			//console.log(features);
	return features;
 }