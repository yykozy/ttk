var TAB = String.fromCharCode(9);
var LF = String.fromCharCode(10);

var fs = require('fs');
    var getAds=function(){
      var json={};
      var category={"jpop":"人気","kpop":"K-POP","johnny":"ジャニーズ"};
      for(var key in category){
        var val=category[key];
        json[key]=[];
        var text = fs.readFileSync('ads/'+key+".tsv", 'utf8');
        var row = text.split(LF);
          for(var j=0;j<row.length;j++){
            var str = row[j].trim().split(TAB);
            var tmp=[];
            for(var i=1;i<str.length;i++){
              if(str[i]=="") continue;
              tmp.push(str[i]);
            }
            var ad = {category:val,name:str[0],keyword:tmp.join(" ")};
console.log(ad)
            json[key].push(ad);
          }
      }
      return json;
    }
console.log(getAds());
