$(function(){
    var ioSocket = io.connect();
	$("#edit").submit(function(){
		return false;
	});
	$("#edit").click(function(){
		var artist = $("#artist").val();
		if(window.confirm("リストを更新しますか？")){
			ioSocket.emit("mgt_artist",{data:artist},function(data){
				alert(data);
				setTimeout(function(){
					location.reload();
				},3000);
			});
		}
	});
});
