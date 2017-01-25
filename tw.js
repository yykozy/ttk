var twitter = require('twitter');
var twitter_client = new twitter({
  consumer_key: 'kxmyFzCpkDiMLpgFkpxnR10ob',
  consumer_secret: 'haIMcmaFBpsaMClTCHizYHiH4RTsYwEI1EukL9KRA9DjrJd4Vc',
  access_token_key: '812840799285059584-GObN6MRNfPmF2sIch47pRYvQNGd2BD7',
  access_token_secret: '5BFo6t368LdHKm0N9B3JFqPYKk07dk9qo38bpxlqB1Qno',
});
var query = "to:@kanpai_girl";
var max_id="";
  twitter_client.get('search/tweets.json',
    { q: query, lang: 'ja', locale: 'ja', max_id: max_id, count: 100, },
    function(error, tweets, response) {
	console.log(tweets);
	}
);
