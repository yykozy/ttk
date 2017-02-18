$(function() {

    "use strict";
    // 許可を取る
//    Notification.requestPermission();

    var ioSocket = io.connect();
//    var max_id = null;
//    var min_id = null;
    var process_flag = false;
    var end_flag = false;
    var option = {};
    var init = true;

	$(window).on("scroll",function(){
		if($(this).scrollTop() > 40){
			$('.container.header-panel,.container.body-panel').addClass("fix");
		}else{
			$('.container.header-panel,.container.body-panel').removeClass("fix");
		}
	});

	$('#ttk-form,#ttk-form2').on("submit",function(){
		return false;
	});
       $('.datepicker').datepicker({
            format: "m月d日",
            language: "ja",
            autoclose: true,
		clearBtn: true,
            orientation: "bottom auto"
        });
	$('#date').on("changeDate",function(e){
		$(this).focus();
	});

	$('#date2').on("changeDate",function(e){
		var a=e.format("m月d日");
		if(a==""){
			a="日付を選択";
			$("#date3").val("");
		}else{
			$("#date3").val(a);
		}
		$(this).html(a+"<span class='caret'></span>");
		$(this).focus();
	        // do something…
		var category = $(this).data("category");
		var value = $(this).data("value");

		//console.log("selected:"+category+"->"+value);
		option[category]=value;
            	$("#messageView .stream-items").html("");
		$('.loading').addClass('on'); //画面にloading表示
		request(false);
	});
/*
        $('#date').on("show",function(){
            var h=$(this).height();
            var p=$(".datepicker").css("top");
//            $(".datepicker").css("top",(parseInt(p)+h/2));
        })
*/       
    $("#search,#search2").click(function() {
	$("#artist2").blur();
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
            var artist = $("#artist").val();
            var artist2 = $("#artist2").val();
		var a=[];
		if(artist!=""){
			a.push(artist);
		}
		if(artist2!=""){
			a.push(artist2);
		}
		query.artist = a.join(" ");
        }
	var date = $(".datepicker:nth-child(2)").val();
	//var date2 = $(".datepicker:nth-child(1)").val();
	var date2 = $("#date3").val();
	if(date!=""){
	        query.date = date;
	}
	if(date2!=""){
	        query.date = date2;
	}
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
        ioSocket.emit("query", json);
    }
    //     var ioSocket = io.connect("https://ttk-saramanda2.c9users.io:13000");

    ioSocket.on("disconnect", function() {});

    function twitter_message(json) {
        $('.loading').removeClass('on'); 
        //console.log(json);
        if(json.data.statuses.length==0){
            $("#messageView .stream-items").html("<div>該当するツイートが見つかりませんでした。</div>");
            $(".readmore button").hide();
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
        var item = '';
        item += '<li class="stream-item">';
        item += '<div class="tweet">';
        item += '<div class="content">';
        item += '<div class="stream-item-header">';
        item += '<a class="tweetlink" rel="nofollow" href="https://twitter.com/' + data.user.screen_name + '">';
        item += '<img class="avatar" src="' + data.user.profile_image_url.replace("http:","https:") + '">';
        item += '<strong class="fullname">' + data.user.name + '</strong>';
        item += '<span class="screen-name">@' + data.user.screen_name + '</span>';
        item += '</a>';
        item += '<a class="timeago" rel="nofollow" title="' + data.timeago + '" href="' + data.link + '">' + data.timeago + '</a>';
        item += '</div>';
        item += '<p class="tweet-text">' + data.text_linked;
        item += '</p>';
        item += '<div class="tweet-action">';
        item += '<a href="https://twitter.com/intent/tweet?in_reply_to=' + data.id_str + '" rel="nofollow" target="_blank"><span class="glyphicon glyphicon-share-alt"></span></a>';
        item += '<a href="https://twitter.com/intent/retweet?tweet_id=' + data.id_str + '" rel="nofollow" target="_blank"><span class="glyphicon glyphicon-retweet"></span></a>';
        item += '<a href="https://twitter.com/intent/favorite?tweet_id=' + data.id_str + '" rel="nofollow" target="_blank"><span class="glyphicon glyphicon-heart"></span></a>';
        item += '</div>';
/*
        item += '<div class="extraction">';
        item +='<div class="sell"><div class="icon"></div><span class="sell-string">'+data.str_sell+'</span></div>';
        item +='<div class="buy"><div class="icon"></div><span class="buy-string">'+data.str_buy+'</span></div>';
        item +='</div>';
*/
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

        //console.log("selected:"+category+"->"+value);
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
    $('#status2 .dropdown-menu a').on('click', function () {
        // do something…
        var category = $(this).data("category");
        var value = $(this).data("value");

        //console.log("selected:"+category+"->"+value);
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
    $("#status2-dropdown-all").click();
    $("#number-dropdown-all").click();
    setTimeout(function(){
        init=false;
    },1000);
    
    $(".readmore").click(function(){
        if (!process_flag && !end_flag) {
            $('.loading').addClass('on'); //画面にloading表示
           proceed();
            //console.log("start");
        }
    });

   if(max_id=="" && min_id==""){
	end_flag = true;
	$(".readmore button").hide();
   } 
});

