$(function(){
    var ioSocket = io.connect();
	$("#edit").submit(function(){
		return false;
	});
	$("#edit").click(function(){
		var category = $("#category").val();
		if(window.confirm("リストを更新しますか？")){
console.log(category);
			ioSocket.emit("mgt_category_detail",{group:group,data:category},function(data){
				alert(data);
				setTimeout(function(){
					location.reload();
				},3000);
			});
		}
	});
});
