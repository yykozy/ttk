var MeCab = require('mecab-async');
var mecab = new MeCab();

var twitter = require('twitter');
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use('/',express.static(path.resolve(__dirname, './static')));
var messages = [];
var sockets = [];
var TAB = String.fromCharCode(9);
var LF = String.fromCharCode(10);
/*
var category = {
  "jpop": "人気",
  "kpop": "K-POP",
  "johnny": "ジャニーズ"
};
*/
var fs = require('fs');

var getCategory=function(){
    var cate = {};
    try{
   	 var text = fs.readFileSync('ads/category.txt', 'utf8');
    }catch(e){
	console.log(e);
	return null;
    }

    var row = text.split(LF);
    for (var j = 0; j < row.length; j++) {
      var str = row[j].trim().split(TAB);
      if(str[0] == "") continue;
	cate[str[0]]=str[1];
    }
    return cate;
}

var getAds = function() {
  var json = {};
  for (var key in category) {
    var val = category[key];
    json[key] = [];
    try{
    	var text = fs.readFileSync('ads/' + key + ".tsv", 'utf8');
    }catch(e){
	console.log(e);
	continue;
    }
    var row = text.split(LF);
    for (var j = 0; j < row.length; j++) {
      var str = row[j].trim().split(TAB);
      if(str[0] == "") continue;
      var tmp = [];
      for (var i = 1; i < str.length-1; i++) {
        if (str[i] == "") continue;
        tmp.push(str[i]);
      }
      var ad = {
        category: val,
        name: str[0],
//        keyword: "'"+tmp.join("' OR '")+"'",
        keyword: tmp.join(" OR "),
        url: str[str.length-1],
      };
      json[key].push(ad);
    }
  }
  return json;
}
var artist_category= {};
var getArtist = function(){
  var ary= {};
  //var ary= [];
  var cate= {};
    try{
    	var text = fs.readFileSync('data/artist_category.list', 'utf8');
    }catch(e){
	console.log(e);
	throw(e);
    }
    var row = text.split(LF);
    for (var j = 0; j < row.length; j++) {
	var str = row[j].trim().split(TAB);
	if(str[0] == "") continue;
	if(typeof cate[str[0]]=="undefined") cate[str[0]]=str[1];
    }

    try{
    	var text = fs.readFileSync('data/artist.list', 'utf8');
    }catch(e){
	console.log(e);
	throw(e);
    }
    var row = text.split(LF);
    for (var j = 0; j < row.length; j++) {
	var str = row[j].trim().split(TAB);
	if(str[0] == "") continue;
	if(typeof ary[str[0]]=="undefined") ary[str[0]]=[];
      var tmp = [];
      for (var i = 1; i < str.length-1; i++) {
        if (str[i] == "") continue;
        tmp.push(str[i]);
      }
      var artistlist = {
        category: str[0],
        name: str[1],
        keyword: tmp.join(" OR "),
//        id: str[1],
//        keyword: str[2],
//        url: str[3],
        url: str[str.length-1],
      };
//      ary.push(artistlist);
      ary[str[0]].push(artistlist);
    }
//console.log(cate);
  artist_category=cate;
  return ary;
}

router.set('view engine', 'ejs');
var category = getCategory();
var ads = getAds();
var artist = getArtist();

//静的アドレス対応
var setStatic=function(){
category = getCategory();
ads = getAds();
artistList = getArtist();
//console.log(artistList);

for(var key in ads){
  for(var i=0;i<ads[key].length;i++){
    var query={};
    query.keyword = ads[key][i].keyword;
    (function(query,url,name){
      console.log(url);
      router.get(url, function(req, res, next) {
        getTweet(query, null, function(tweets, max_id, min_id) {
          var data = {};
          data.category = category = getCategory();
          data.ads = ads = getAds();
          data.tweets = tweets;
          data.request = query;
          data.max_id = max_id;
          data.min_id = min_id;
          data.static = {name:name};
          res.render('index', {
            data: data
          });
        });
      });
    })(query,ads[key][i].url,ads[key][i].name);
  }
}

for(var cate in artistList){
  for(var i=0;i<artistList[cate].length;i++){
//  for(var i=0;i<artistList.length;i++){
    var query={};
    query.keyword = artistList[cate][i].keyword;
    //query.keyword = artistList[i].keyword;
    (function(query,url,name){
      router.get(url, function(req, res, next) {
        getTweet(query, null, function(tweets, max_id, min_id) {
          var data = {};
          data.category = category = getCategory();
          data.ads = ads = getAds();
          data.tweets = tweets;
          data.request = query;
          data.max_id = max_id;
          data.min_id = min_id;
          data.static = {name:name};
          res.render('index', {
            data: data
          });
        });
      });
    })(query,artistList[cate][i].url,artistList[cate][i].name);
    //})(query,artistList[i].url,artistList[i].name);
  }
}
}
setStatic();

router.get('/list/:category', function(req, res, next) {
   var data={};
	data.category = category = getCategory();
	data.ads = ads = getAds();
	data.artist_genre= req.params.category;
	data.artist = getArtist()[data.artist_genre];
	data.artist_category = artist_category;
if(typeof data.artist=="undefined"){
	res.redirect("/"+req.params.category);
}else{
	if(req.query.p){
		var page=parseInt(req.query.p);
	}else{
		var page=1;
	}
	data.page=page;
console.log(data);
    res.render('top_list', {
      data: data
    });
}
});

router.get('/_top', function(req, res, next) {
   var data={};
	data.category = category = getCategory();
	data.ads = ads = getAds();
	data.artist = getArtist();
	data.artist_category = artist_category;
    res.render('top', {
      data: data
    });
});

router.get('/', function(req, res, next) {
  console.log(req.query);
  //  res.sendfile('index.html');
  var query = {};
  var flag=false;
  if (req.query.artist) {
    query.artist = req.query.artist;
    flag=true;
  }
  if (req.query.place) {
    query.place = req.query.place;
    flag=true;
  }
  if (req.query.date) {
    query.date = req.query.date;
    flag=true;
  }
  if (req.query.way) {
    query.way = req.query.way;
    flag=true;
  }
  if (req.query.count) {
    query.count = req.query.count;
    flag=true;
  }
  if (req.query.keyword) {
    query.keyword = req.query.keyword;
    flag=true;
  }

if(flag){
  getTweet(query, null, function(tweets, max_id, min_id) {
    var data = {};
    data.ads = ads = getAds();
    getArtist();
    data.category = category = getCategory();
    data.tweets = tweets;
    data.request = query;
    data.max_id = max_id;
    data.min_id = min_id;
    res.render('index', {
      data: data
    });
  });

}else{
   var data={};
	data.category = category = getCategory();
	data.ads = ads = getAds();
	data.artist = getArtist();
	data.artist_category = artist_category;
    res.render('top', {
      data: data
    });

}

});

io.on('connection', function(socket) {
  messages.forEach(function(data) {
    socket.emit('message', data);
  });

  sockets.push(socket);

  socket.on('disconnect', function() {
    sockets.splice(sockets.indexOf(socket), 1);
    console.log("disconnected");
  });

  socket.on('query', function(req) {
    console.log(req);
    request(socket, req)
  })

  socket.on('artist_category', function(req) {
    console.log(req);
    socket.emit('artist_list',{category:artist_category,artist:artistList});
  })

  socket.on('error', function() {
    console.log("error");
  })

//広告更新
  socket.on('mgt_ads', function(req,res) {
    fs.writeFileSync("ads/ads.txt",req);
    res("書き込みしました");
  })

  socket.on('mgt_ads_detail', function(req,res) {
    fs.writeFileSync("views/"+req.group.replace("_","-")+".ejs",req.data);
    res("書き込みしました");
  })

//カテゴリ更新
  socket.on('mgt_category', function(req,res) {
    console.log(req);
    fs.writeFileSync("ads/category.txt",req);
    res("書き込みしました");
  })

  socket.on('mgt_category_detail', function(req,res) {
    fs.writeFileSync("ads/"+req.group+".tsv",req.data);
    res("書き込みしました(OK押下後、3秒後にリロードします)");
    setStatic();
  })

//アーティストリスト更新
  socket.on('mgt_artist', function(req,res) {
    console.log(req);
    fs.writeFileSync("data/artist.list",req.data);
    res("書き込みしました(OK押下後、3秒後にリロードします)");
    setStatic();
  })

});

var twitter_client = new twitter({
/*
  consumer_key: 'kxmyFzCpkDiMLpgFkpxnR10ob',
  consumer_secret: 'haIMcmaFBpsaMClTCHizYHiH4RTsYwEI1EukL9KRA9DjrJd4Vc',
  access_token_key: '812840799285059584-GObN6MRNfPmF2sIch47pRYvQNGd2BD7',
  access_token_secret: '5BFo6t368LdHKm0N9B3JFqPYKk07dk9qo38bpxlqB1Qno',
*/
        consumer_key : 'XZhJUrOxMvBINBl2UzJk30eKX' ,        // APIキー
        consumer_secret : 'oEVLPM4vnpczTTTo8BVohU2kXjvQA5Wvem1JDhfJcOJ817ZKgx' ,    // APIシークレット
        access_token_key : '826591255568134144-mD0RQvnzxibojnHwZmm6nvBg7xivRVy' ,  // アクセストークン
        access_token_secret : 'eRLLLnAizik5su2rf84BYakyoKv4hxBPcAa1JsuuTgeZt' ,
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

io.sockets.on('connection', function(socket) {
  /*
    if(!socket.connected){
      socket.connect();
    }
    console.log("hoge");
  */
})

var request = function(socket, json) {
  var req = json.query;
  var flag = json.flag;
  var max_id = json.max_id;

  var tweets = getTweet(req, max_id, function(tweets, max_id, min_id) {
    console.log(req);
    io.sockets.socket(socket.id).emit('twitter_message', {
      'data': tweets,
      'max_id': max_id,
      'min_id': min_id,
      'request': req
    })
  });
};

var getTweet = function(req, max_id, callback) {

  var ary = ["exclude:replies", "exclude:retweets", "チケット"];
  for (var i in req) {
    if (req[i] != null && req[i] != "") {
      if (i == "date") {
//        ary.push('"' + req[i] + '" OR "' + req[i].split('/').join('月') + '日"');
        //ary.push(req[i] + " OR " + req[i].split('/').join('月') + '日');
        ary.push(req[i] + " OR " + req[i].replace('月','/').replace('日',''));
      } else if (i=="keyword"){
        ary.push(req[i]);
      } else {
//        ary.push("'" + req[i].replace(/ /g,"' OR '") + "'");
        ary.push(req[i].replace(/ /g," OR "));
//      } else {
//        ary.push('"' + req[i] + '"');
      }
    }
  }
  if(ary.length<3) {
    callback({},null,null);
    return;
  }
  var query = ary.join(" ");
//  console.log(query);
  twitter_client.get('search/tweets.json',

    {
      q: query,
      lang: 'ja',
      locale: 'ja',
      max_id: max_id,
      count: 10,
    },

    function(error, tweets, response) {
//      console.log(tweets.statuses.length);
      if (typeof tweets["statuses"] != "undefined" && tweets.statuses.length > 0) {
        var max_id = tweets.statuses[0].id_str;
        var min_id = tweets.statuses[tweets.statuses.length - 1].id_str;

      for (var k = 0; k < tweets.statuses.length; k++) {
//        console.log(k+"/"+tweets.statuses.length);
        var tweet = tweets.statuses[k];
        var created_at = new Date(tweet.created_at);//.toLocaleString();
        var now = new Date();
        var diff = now-created_at;
        var timeago=0;
        if(diff/3600000>24){
var options = {
    //weekday: "long", year: "numeric", month: "short",
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
};
            timeago=created_at.toLocaleTimeString("ja-JP",options);
        }else if(diff/3600000>1){
            timeago=parseInt(diff/3600000)+"時間";
        }else if(diff/60000>1){
            timeago=parseInt(diff/60000)+"分";
        }else{
            timeago=parseInt(diff/1000)+"秒";
        }
        tweets.statuses[k].timeago=timeago;

        var link = 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
        tweets.statuses[k].link=link;
        
        var hashtags = tweet.entities.hashtags;
        var text = tweet.text;
        for (var j = 0; j < hashtags.length; j++) {
            text = text.replace(new RegExp("#" + hashtags[j].text, "g"), '<a href="https://twitter.com/hashtag/' + hashtags[j].text + '" class="hashtag" rel="nofollow">#' + hashtags[j].text + '</a>');
        }
        for (var j in req) {
//          console.log(ary);
            if (req[j] == "" || typeof req[j]=="undefined") continue;
            if(j=="date" && req.date!=""){
                var q = req.date.split("/").join("月")+"日";
                text = text.replace(new RegExp(q,"gi"), "<span class='highlight'>$&</span>");
            }
            if(j == "keyword") continue;
//            console.log(req[j]);
            text = text.replace(new RegExp(req[j].replace(/ /g,"|"),"gi"), "<span class='highlight'>$&</span>");
        }
        
	var urls = tweet.entities.urls;
	for(var s=0;s<urls.length;s++){
		if(urls[s].url=="") continue;
		var url = urls[s].url;
		text=text.replace(url,'<a href="'+url+'">'+url+'</a>');
	}
        tweets.statuses[k].text_linked=text;

        //形態素解析
	var hashtags = tweet.entities.hashtags;
	var pretext = tweet.text;
	for(var s=0;s<hashtags.length;s++){
		pretext = pretext.replace("#"+hashtags[s].text,"");
	}
        //var result = mecab.parseSync(tweet.text);
//        var result = mecab.parseSync(pretext);
        var str1 = [];
        var str2 = [];
/*
        for (var i = 0; i < result.length; i++) {
          if (result[i][0] == "求" && result[i][1] == "名詞" && str1.length == 0) {
            for (var j = i + 1; j < result.length; j++) {
              if (result[j][0] == "EOS" && str1.join("").length > 2) {
                //                        i=j+1;
                break;
              }
              else {
                if (result[j][0] != "EOS") {
                  str1.push(result[j][0]);
                }
              }
            }
          }
          if (result[i][0] == "譲" && result[i][1] == "名詞" && str2.length == 0) {
            for (var j = i + 1; j < result.length; j++) {
              if (result[j][0] == "EOS" && str2.join("").length > 2) {
                //                        i=j+1;
                break;
              }
              else {
                if (result[j][0] != "EOS") {
                  str2.push(result[j][0]);
                }
              }
            }
          }
        }
*/
        var str_buy = (str1.length == 0) ? "ー" : str1.join(" ");
        var str_sell = (str2.length == 0) ? "ー" : str2.join(" ");
	str_buy = str_buy.replace(/^[》)：:»→】]/,"");
	str_sell = str_sell.replace(/^[》)：:»→】]/,"");
//        tweets.statuses[k].mecab = result;
        tweets.statuses[k].str_buy = str_buy;
        tweets.statuses[k].str_sell = str_sell;
      }

      }

      callback(tweets, max_id, min_id);
    }
  );

}

router.get('/_mgt', function(req, res, next) {
  category = getCategory();
//  ads = getAds();
  res.render('mgt',{category:category,ads:ads});
});

router.get('/_mgt/ads', function(req, res, next) {
  var query = {};
  if (req.query.g) {
	var adlist={};
	try{
		var list = fs.readFileSync('ads/ads.txt', 'utf8');
		if(list!=""){
			var row=list.split("\n");
			for(var i=0;i<row.length;i++){
				var a = row[i].split("\t");
				adlist[a[0].replace("-","_")] = a[1];
			}
		}
		var text = fs.readFileSync('views/' + req.query.g.replace("_","-")+ ".ejs", 'utf8');
	}catch(e){
		console.log(e);
		var text = "";
	}
	res.render('mgt_ads_detail',{g:req.query.g,text:text,ads:adlist});
  }else{
	var adlist={};
	try{
		var text = fs.readFileSync('ads/ads.txt', 'utf8');
		if(text!=""){
			var row=text.split("\n");
			for(var i=0;i<row.length;i++){
				var a = row[i].split("\t");
				adlist[a[0].replace("-","_")] = a[1];
			}
		}
//console.log(adlist);
	}catch(e){
		console.log(e);
		var text = "";
	}
  	res.render('mgt_ads',{text:text,ads:adlist});
  }
});

router.get('/_mgt/cate', function(req, res, next) {
  var query = {};
  if (req.query.g) {
	try{
		var text = fs.readFileSync('ads/' + req.query.g+ ".tsv", 'utf8');
	}catch(e){
		console.log(e);
		var text = "";
	}
	res.render('mgt_cate_detail',{category:getCategory(),g:req.query.g,text:text});
  }else{
	res.render('mgt_cate',{category:getCategory()});
  }
});

router.get('/_mgt/artist', function(req, res, next) {
	var query = {};
	try{
		var text = fs.readFileSync('data/artist.list', 'utf8');
	}catch(e){
		console.log(e);
		var text = "";
	}
	res.render('mgt_artist',{text:text});
});
