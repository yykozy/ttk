<?php
$fp = fopen("artist.list","r");
$fpw = fopen("sitemap.txt","w");
$out=<<<EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

<!--  created with free sitemap generation system www.sitemapxml.jp  --> 
<url>
  <loc>http://ticketsnow.jp/</loc>
  <priority>1.0</priority>
</url>
EOF;
fwrite($fpw,$out);

$line = trim(fgets($fpw));
if($line==null) $line=0;
$count=0;
while($str = fgets($fp)){
	$count++;
	if($count<=$line) continue;
	list($genre,$name,$key1,$key2,$key3,$url) = explode("\t",trim($str));
	$str = "<url>\n"
		."\t<loc>http://ticketsnow.jp".$url."</loc>\n"
		."\t<priority>0.8</priority>\n"
		."</url>\n";
	//ftruncate($fpw,0);
	//fseek($fpw,0); 
	fwrite($fpw,$str);
}
/*
*/
