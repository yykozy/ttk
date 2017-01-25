$(function() {

    "use strict";
    // 許可を取る
    Notification.requestPermission();

    var ioSocket = io.connect();
    var max_id = null;
    var min_id = null;
    var process_flag = false;
    var end_flag = false;
    var option = {};
    var init = true;

       $('#date').datepicker({
            format: "m/d",
            language: "ja",
            autoclose: true,
            orientation: "bottom auto"
        });
        $('#date').on("show",function(){
            var h=$(this).height();
            var p=$(".datepicker").css("top");
            console.log(h+":"+p+":"+(parseInt(p)+h/2));
            $(".datepicker").css("top",(parseInt(p)+h/2));
        })
        
    $("#search").click(function() {
        $("#messageView .stream-items").html("");
        //リストキーワードはリセット
        $("#keyword").val("");
        $('.loading').addClass('on'); //画面にloading表示
        end_flag = false;
        request(false);
        var str=[];
        var query = getQuery();
        for(var i in query){
            str.push(query[i]);
        }
        $("#search-query h4").html(str.join(" ")+"のチケット検索結果");
    });

    function getQuery(){
        var query={};
        var keyword = $("#keyword").val();
        if(keyword!=""){
            query.keyword=keyword;
        }else{
            query.artist = $("#artist").val();
        }
        query.date = $("#date").val();
        /*
//        query.type = $("input[name='type']:checked").val();
//        query.title = $("#title").val();
        if(query.date!=""){
            query.date2 = query.date.split("/").join("月")+"日";
        }else{
            query.date2 = "";
        }
        */
        query.place = $("#place").val();
        if(option.status){
            query.way = option.status;
        }
        if(option.number){
            query.count = option.number;
        }
//        query.count = $("#count").val();
//        query.way = $("input[name='way']:checked").val();
        return query;
    }
    function request(flag) {
        //flag:true->pageネーション, false->init/refresh
        var json = {};
//        json.query = $.extend(true, {}, query);;
        json.query = getQuery();
       json.flag = flag;

        if (flag) {
            json.max_id = min_id;
        }
        else {
            max_id = null;
            min_id = null;
            json.max_id = null;
        }
console.log(json);
        ioSocket.emit("query", json);
    }
    //     var ioSocket = io.connect("https://ttk-saramanda2.c9users.io:13000");

    ioSocket.on("disconnect", function() {});

    function twitter_message(json) {
        $('.loading').removeClass('on'); 
        console.log(json);
        if(json.data.statuses.length==0){
            $("#messageView .stream-items").html("<div>該当するツイートが見つかりませんでした。</div>");
            end_flag = true;
            return false;
        }
        if (max_id!=null && json.max_id == json.min_id) {
            end_flag = true;
            $(".readmore button").hide();
            return false;
        }
        for(var i=0;i<json.data.statuses.length;i++){
//            console.log(json.data.statuses[i]);
            if(min_id == json.data.statuses[i].id_str) continue;
            appendMessage(json.data.statuses[i],json.request);
        }
        max_id = json.max_id;
        min_id = json.min_id;
        $(".readmore button").show();

    }
    
    ioSocket.on("twitter_message",twitter_message);

    function appendMessage(data,query) {
        /*
        var created_at = new Date(data.created_at);//.toLocaleString();
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
        var link = 'https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str;
        */
        var item = '';
        item += '<li class="stream-item">';
        item += '<div class="tweet">';
        item += '<div class="content">';
        item += '<div class="stream-item-header">';
        item += '<a rel="nofollow" href="https://twitter.com/' + data.user.screen_name + '">';
        item += '<img class="avatar" src="' + data.user.profile_image_url.replace("http:","https:") + '">';
        item += '<strong class="fullname">' + data.user.name + '</strong>';
        item += '<span class="screen-name">@' + data.user.screen_name + '</span>';
        item += '</a>';
        item += '<a class="timeago" rel="nofollow" title="' + data.timeago + '" href="' + data.link + '">' + data.timeago + '</a>';
        item += '</div>';
        /*
        var hashtags = data.entities.hashtags;
        var text = data.text;
        for (var i = 0; i < hashtags.length; i++) {
            //                item += '<a href="https://twitter.com/hashtag/'+hashtags[i].text+'" class="hashtag" rel="nofollow">#'+hashtags[i].text+'</a> ';
            text = text.replace(new RegExp("#" + hashtags[i].text, "g"), '<a href="https://twitter.com/hashtag/' + hashtags[i].text + '" class="hashtag" rel="nofollow">#' + hashtags[i].text + '</a>');
        }
        for (var i in query) {
            if (query[i] == "" || typeof query[i]=="undefined") continue;
            console.log(query[i]);
            text = text.replace(new RegExp(query[i],"gi"), "<span class='highlight'>$&</span>");
        }
        */
        item += '<p class="tweet-text">' + data.text_linked;
        item += '</p>';
//        item += '<div style="border-top:1px dotted;border-bottom:1px dotted">';
        item += '<div class="tweet-action">';
//        item += '<span class="glyphicon glyphicon-arrow-left"></span><a href="https://twitter.com/intent/tweet?in_reply_to=' + data.id_str + '" rel="nofollow" target="_blank">返信</a>';
//        item += '<span class="glyphicon glyphicon-retweet"></span><a href="https://twitter.com/intent/retweet?tweet_id=' + data.id_str + '" rel="nofollow" target="_blank">リツイート</a>';
//        item += '<span class="glyphicon glyphicon-star"></span><a href="https://twitter.com/intent/favorite?tweet_id=' + data.id_str + '" rel="nofollow" target="_blank">お気に入りに登録</a>';
        item += '<a href="https://twitter.com/intent/tweet?in_reply_to=' + data.id_str + '" rel="nofollow" target="_blank"><span class="glyphicon glyphicon-share-alt"></span></a>';
        item += '<a href="https://twitter.com/intent/retweet?tweet_id=' + data.id_str + '" rel="nofollow" target="_blank"><span class="glyphicon glyphicon-retweet"></span></a>';
        item += '<a href="https://twitter.com/intent/favorite?tweet_id=' + data.id_str + '" rel="nofollow" target="_blank"><span class="glyphicon glyphicon-heart"></span></a>';
        item += '</div>';
        item += '<div class="extraction">';
        /*
        var mecab=[];
        var str1=[];
        var str2=[];
        for(var i=0;i<data.mecab.length;i++){
            if(data.mecab[i][0]=="求" && data.mecab[i][1]=="名詞" && str1.length==0){
                for(var j=i+1;j<data.mecab.length;j++){
                    if(data.mecab[j][0]=="EOS" && str1.join("").length>2){
//                        i=j+1;
                        break;
                    }else{
                        if(data.mecab[j][0]!="EOS"){
                            str1.push(data.mecab[j][0]);
                        }
                    }
                }
            }
            if(data.mecab[i][0]=="譲" && data.mecab[i][1]=="名詞" && str2.length==0){
                for(var j=i+1;j<data.mecab.length;j++){
                    if(data.mecab[j][0]=="EOS" && str2.join("").length>2){
//                        i=j+1;
                        break;
                    }else{
                        if(data.mecab[j][0]!="EOS"){
                            str2.push(data.mecab[j][0]);
                        }
                    }
                }
            }
            mecab.push(data.mecab[i][0]);
        }
        var str_buy = (str1.length==0)?"なし":str1.join(" ");
        var str_sell = (str2.length==0)?"なし":str2.join(" ");
        */
        item +='<p class="sell"><span class="icon">譲</span><span class="sell-string">'+data.str_sell+'</span></p>';
        item +='<p class="buy"><span class="icon">求</span><span class="buy-string">'+data.str_buy+'</span></p>';
//        item +='<span style="font-size:0.2em">'+mecab.join(" ")+'</span>';
        item +='</div>';
        item += '</div>';
        item += '</div><!-- /.tweet -->';
        item += '</li>';
        $("#messageView .stream-items").append(item);
    }

    var proceed = function() {
        $(".readmore button").prop("disabled",true);
        request(true);
        process_flag = true;
        setTimeout(function() {
            process_flag = false;
            $(".readmore button").prop("disabled",false);
            console.log("end");
        }, 3000);
    }
    
    //自動ロード
    /*
    $(window).bottom({
        proximity: 0.001
    }); //proximityを0.5にするとページの50％までスクロールするとloadingがはじまる
    $(window).bind("bottom", function() {
        if(max_id==null) return false;
//        json.query = getQuery();
        if (!process_flag && !end_flag) {
            proceed();
            console.log("start");
        }
    });
    */
    
    //絞り込み
    $('#status .dropdown-menu a,#number .dropdown-menu a').on('click', function () {
        // do something…
        var category = $(this).data("category");
        var value = $(this).data("value");

        console.log("selected:"+category+"->"+value);
        option[category]=value;
        $(this).parent().siblings().each(function(i,obj){
            $("a span",obj).remove();
        })
        $("span",this).remove();
        $(this).prepend("<span class='glyphicon glyphicon-ok'></span>");
        if(!init){
            var str = $(this).text();
            $(this).parent().parent().siblings("a").html(str+'<span class="caret">');
            $("#messageView .stream-items").html("");
            $('.loading').addClass('on'); //画面にloading表示
            request(false);
        }
    })
    $("#status-dropdown-all").click();
    $("#number-dropdown-all").click();
    setTimeout(function(){
        init=false;
    },1000);
    
    $(".readmore").click(function(){
        if (!process_flag && !end_flag) {
            $('.loading').addClass('on'); //画面にloading表示
           proceed();
            console.log("start");
        }
    });
});

