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

/*
var postForm = function(url, data) {
        var $form = $('<form/>', {'action': url, 'method': 'post'});
        for(var key in data) {
                $form.append($('<input/>', {'type': 'hidden', 'name': key, 'value': data[key]}));
        }
        $form.appendTo(document.body);
        $form.submit();
};
*/
    $("#search,#search2").click(function() {
        $("#keyword").val("");
        var query = getQuery();
//遷移
	location.href="/?"+$.param(query);
/*
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
*/
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
/*
var categoryData={},artistData={};
    ioSocket.emit("artist_category",{});
    ioSocket.on("artist_list",function(json){
console.log(json);
	categoryData=json.category;
	artistData=json.artist;
    });

    $(".readmore").click(function(){
	var category = $(this).parent().data("category");
	setArtist(category);
    });

    var setArtist=function(category){
//	var category=json.category;
	var artistlist=artistData[category];
	var count = $("div.artist-category[data-category='"+category+"'] .artist-list .artist-item").length;
	var html="";
	for(var i=count;i<artistlist.length;i++){
		if(i>count+5) break;
		var artist=artistlist[i];
		html+='<li class="artist-item"><a href="'+artist.url+'">'+artist.name+'</a></li>';
	}
	$("div.artist-category[data-category='"+category+"'] .artist-list").append(html);
    }
*/

});

