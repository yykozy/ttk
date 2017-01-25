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

router.use(express.static(path.resolve(__dirname, './')));
var messages = [];
var sockets = [];
var TAB = String.fromCharCode(9);
var LF = String.fromCharCode(10);
var category = {
  "jpop": "人気",
  "kpop": "K-POP",
  "johnny": "ジャニーズ"
};

var fs = require('fs');

var getAds = function() {
  var json = {};
  for (var key in category) {
    var val = category[key];
    json[key] = [];
    var text = fs.readFileSync('ads/' + key + ".tsv", 'utf8');
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
var ads = getAds();

router.set('view engine', 'ejs');

//静的アドレス対応
for(var key in ads){
  for(var i=0;i<ads[key].length;i++){
    var query={};
    query.keyword = ads[key][i].keyword;
    (function(query,url,name){
      console.log(url);
      router.get(url, function(req, res, next) {
        getTweet(query, null, function(tweets, max_id, min_id) {
          var data = {};
          data.ads = ads;
          data.category = category;
          data.tweets = tweets;
          data.request = query;
          data.static = {name:name};
          res.render('index', {
            data: data
          });
        });
      });
    })(query,ads[key][i].url,ads[key][i].name);
  }
}

router.get('/', function(req, res, next) {
  console.log(req.query);
  //  res.sendfile('index.html');
  var query = {};
  if (req.query.artist) {
    query.artist = req.query.artist;
  }
  if (req.query.place) {
    query.place = req.query.place;
  }
  if (req.query.date) {
    query.date = req.query.date;
  }
  if (req.query.way) {
    query.way = req.query.way;
  }
  if (req.query.count) {
    query.count = req.query.count;
  }
  if (req.query.keyword) {
    query.keyword = req.query.keyword;
  }

  getTweet(query, null, function(tweets, max_id, min_id) {
    var data = {};
    data.ads = ads;
    data.category = category;
    data.tweets = tweets;
    data.request = query;
    res.render('index', {
      data: data
    });
  });

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

  socket.on('error', function() {
    console.log("error");
  })
});

var twitter_client = new twitter({
  consumer_key: 'kxmyFzCpkDiMLpgFkpxnR10ob',
  consumer_secret: 'haIMcmaFBpsaMClTCHizYHiH4RTsYwEI1EukL9KRA9DjrJd4Vc',
  access_token_key: '812840799285059584-GObN6MRNfPmF2sIch47pRYvQNGd2BD7',
  access_token_secret: '5BFo6t368LdHKm0N9B3JFqPYKk07dk9qo38bpxlqB1Qno',
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

  var ary = ["exclude:retweets", "チケット"];
  for (var i in req) {
    if (req[i] != null && req[i] != "") {
      if (i == "date") {
//        ary.push('"' + req[i] + '" OR "' + req[i].split('/').join('月') + '日"');
        ary.push(req[i] + " OR " + req[i].split('/').join('月') + '日');
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
      console.log(tweets.statuses.length);
      if (typeof tweets["statuses"] != "undefined" && tweets.statuses.length > 0) {
        var max_id = tweets.statuses[0].id_str;
        var min_id = tweets.statuses[tweets.statuses.length - 1].id_str;
      }
      for (var k = 0; k < tweets.statuses.length; k++) {
//        console.log(k+"/"+tweets.statuses.length);
        var tweet = tweets.statuses[k];
        var created_at = new Date(tweet.created_at);//.toLocaleString();
        var now = new Date();
        var diff = now-created_at;
        var timeago=0;
        if(diff/3600000>24){
            timeago=created_at.toLocaleString();
        }else if(diff/3600000>1){
            timeago=parseInt(diff/3600000)+"時間前";
        }else if(diff/60000>1){
            timeago=parseInt(diff/60000)+"分前";
        }else{
            timeago=parseInt(diff/1000)+"秒前";
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
            console.log(req[j]);
            text = text.replace(new RegExp(req[j].replace(/ /g,"|"),"gi"), "<span class='highlight'>$&</span>");
        }
        tweets.statuses[k].text_linked=text;
        
        //形態素解析
        var result = mecab.parseSync(tweet.text);
        var str1 = [];
        var str2 = [];
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
        var str_buy = (str1.length == 0) ? "ー" : str1.join(" ");
        var str_sell = (str2.length == 0) ? "ー" : str2.join(" ");

        tweets.statuses[k].mecab = result;
        tweets.statuses[k].str_buy = str_buy;
        tweets.statuses[k].str_sell = str_sell;
      }

      callback(tweets, max_id, min_id);
    }
  );

}
