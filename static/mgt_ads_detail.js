$(function(){
    var ioSocket = io.connect();
	$("#edit").submit(function(){
		return false;
	});
	$("#edit").click(function(){
		var ads = $("#ads").val();
		if(window.confirm("広告枠を更新しますか？")){
			ioSocket.emit("mgt_ads_detail",{group:group,data:ads},function(data){
				alert(data);
				location.reload();
			});
		}
	});
});
