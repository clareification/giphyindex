var indico = require('indico.io');
indico.apiKey = '68cd5c1dafb61295a5f288b517bd083b';

settings = {"api_key": "68cd5c1dafb61295a5f288b517bd083b"};

var inputText = "UPDATE: Qatari sheikh leaves US after Ferrari race through LA";
var input2 = "AVG can sell your browsing and search history to advertisers";

var topics1 = [];
var topics2 = [];

indico.texttags(inputText, settings)
  .then(function(res) {
  	//console.log(res);

    for(var key in res){
    	if(res.hasOwnProperty(key)){
    		//console.log(res[key]);
    		topics1.push(res[key]);
    	}
    }

    //console.log("Topics 1 : " + topics1);
    topics1.concat("tester");

  }).catch(function(err) {
    console.warn(err);
  });


indico.texttags(inputText, settings)
  .then(function(res) {
    topics2 = res;
    //console.log(res);
  }).catch(function(err) {
    console.warn(err);
  });

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



//console.log(topics1);
//console.log(topics2);


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

