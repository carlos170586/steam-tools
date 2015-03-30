// ==UserScript==
// @name           [Steam] Rep
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Right click for check the Steam user rep
// @include        http://steamcommunity.com/*
// @include        http://store.steampowered.com/*
// @require        http://steamcommunity-a.akamaihd.net/public/javascript/jquery-1.11.1.min.js?v=.isFTSRckeNhC
// @version        1
// @grant          GM_xmlhttpRequest
// ==/UserScript==

var steamRep=(function(){
	var srp=[];//SteamRepProfile

	function printRep(id){
		var st=srp[id].reputation.summary;
		if(srp[id].flags.status!='notfound')
			$('#steamRep').html('\
<div style="float:left;margin:4px;">\
<a style="float:left;margin:4px;margin-right:6px;" href="http://steamcommunity.com/profiles/'+id+'" target="_blank"><img width="64" height="64" src="'+srp[id].avatar+'" style="border: 1px solid gray;border-radius:5px;"></a>\
<div style="float:left;margin-left:3px;">\
<a style="font-size:12pt;margin-bottom:5px;display:block;text-decoration:none;color:#000" href="http://steamcommunity.com/profiles/'+id+'" target="_blank"><b>'+srp[id].displayname+'</b></a>\
<table style="font-size:10px;">\
'+(srp[id].membersince!=0?'<tr><td style="color:blue;margin-left:3px;">Joined Steam: </td><td>'+new Date(srp[id].membersince*1000).toLocaleDateString()+'</td></tr>':'')+'\
'+(srp[id].vacban!="0"?'<tr><td style="color:blue;margin-left:3px;">VAC Status: </td><td style="color:#f00">Banned</td></tr>':'')+'\
'+(srp[id].tradeban!="1"?'<tr><td style="color:blue;margin-left:3px;">Trade Status: </td><td'+(srp[id].tradeban!="3"?' style="color:#f00">Banned':' style="color:#FC970A">Valve Trade Probation')+'</td></tr>':'')+'\
</table>\
<div style="margin:10px;font-family:monospace;font-size:10px;color:#'+(st.indexOf("SCAMMER")!=-1?'f00':(st.indexOf("CAUTION")!=-1?'FC970A':(st.indexOf("TRUSTED")!=-1 || st.indexOf("MIDDLEMAN")!=-1 || st.indexOf("ADMIN")!=-1?'40BF00':'000')))+'">'+(st=='none'?'No special reputation':st)+'</div>\
</div>\
<div style="clear:both;"></div>\
<a style="float:left;margin-top:2px;margin-left:-3px;padding-right:4px;" href="http://steamrep.com/profiles/'+id+'" target="_blank"><img height="20px" src="http://steamrep.com/data/ico/logo03.png"></a>\
<div style="margin-top:8px;text-align:right;width:100%;margin-left:8px;">\
<span style="font-size:9px;color:#aaa;margin-right:8px;text-align:right;">Cached: '+(srp[id].lastsynctime!="0"?new Date(srp[id].lastsynctime*1000).toLocaleDateString():'')+'</span>\
</div>\
</div>');
		else
			$('#steamRep').html('No records on SteamRep Database');
		$('#steamRep').show();
	};
	function getRep(id){
		if(srp[id])
			return printRep(id);
		GM_xmlhttpRequest({
			method:"GET",
			url:'https://steamrep.com/api/beta3/reputation/'+id+'?json=1&extended=1',
			onload:function(r){
				srp[id]=JSON.parse(r.responseText).steamrep;
				printRep(id);
			}
		});
	};

	$(document).ready(function(){
		$(document).on("contextmenu","a",function(e){
			$('#steamRep').length || $('body').append('<div id=steamRep style="min-width: 300px; border-radius: 5px; position: absolute; border: 1px solid black; background: none repeat scroll 0% 0% white; padding:3px; color: rgb(51, 51, 51);"></div>');
			$('#steamRep').css('top',e.pageY).css('left',e.pageX).show().html('');
			var href=$(this).attr('href');
			if(href.match(/http:\/\/steamcommunity.com\/profiles\/.+/))
				getRep(href.split('/')[4]);
			else if(href.match(/http:\/\/steamcommunity.com\/id\/.+/))
				$.get(href,{'xml':1},function(d){
					getRep($('steamID64',d).text());
				});
			else return;
			e.preventDefault();
		});
		$(document).on("click",function(){
			$("#steamRep").hide();
		});
	});
})();