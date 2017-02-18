<?php
include("twpost.php");
$twpost = new twpost();
$fp = fopen("artist.list","r");
$fpw = fopen("eot.txt","c+");
$line = trim(fgets($fpw));
if($line==null) $line=0;
$count=0;
while($str = fgets($fp)){
	$count++;
	if($count<=$line) continue;
	list($text,$id,$query,$url) = explode("\t",trim($str));
	$str=$text."のチケット情報。Twitterでつぶやかれた".$text."のチケットについてリアルタイムに検索。";
	$str.="https://ticketsnow.jp/".$url;
	$twpost->post($str);
	ftruncate($fpw,0);
	fseek($fpw,0); 
	fwrite($fpw,$count);
	sleep(40);
}
