$(function(){
    var ioSocket = io.connect();
$("#category").val();
	$("#edit").submit(function(){
console.log($("#category").val());
		return false;
	});
	$("#edit").click(function(){
		var category = $("#category").val();
		if(window.confirm("リストを更新しますか？")){
console.log(category);
			ioSocket.emit("mgt_category",category,function(data){
				alert(data);
				location.reload();
			});
		}
	});
});
