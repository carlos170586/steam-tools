// ==UserScript==
// @name           [Steam] Cards
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Display info about your cards and badges
// @include        http://steamcommunity.com/id/*
// @include        http://steamcommunity.com/profiles/*
// @updateURL      https://github.com/carlos170586/steam-tools/raw/master/greasemonkey/steam_cards.user.js
// @version        2
// @grant          none
// ==/UserScript==

(function(){
	var profileURL=$J('#global_actions .playerAvatar a').attr('href'),
	profileLinks=[//Profile links
		['SteamTools','http://steam.tools/itemvalue/#/'+g_rgProfileData.steamid+'-753'],
		['SteamDB','https://steamdb.info/calculator/'+g_rgProfileData.steamid],
		['SteamREP','http://steamrep.com/profiles/'+g_rgProfileData.steamid],
	];

	function badgePage(){
	}

	$J(document).ready(function(){
		if(location.href.match(/http:\/\/steamcommunity.com\/(id|profiles)\/.+\/badges/))
			badgePage();
		else if(location.href.match(/http:\/\/steamcommunity.com\/(id|profiles)\/.+\/gamecards\/[0-9]+\//)))
			badgePage();
	});
})();


/*$J('.badge_craft_button').each(function(){
			$J.ajax( {
				url: 'http://steamcommunity.com/id/carlos-/ajaxcraftbadge/',
				type: 'POST',
          data: {
					appid: $J(this).attr('href').split('/')[6],
            border_color: $J(this).attr('href').split('/')[7]=='?border=1'?1:0,
					series: 1,
					sessionid: g_sessionID
				},
				crossDomain: true,
				xhrFields:{withCredentials:true}
			}).done(function(d){
			}).fail(function(r){
			});
});

http://steamcommunity.com/market/search?category_753_Game[]=tag_app_'+id+'&category_753_cardborder[]=tag_cardborder_'+(isFoil?1:0)		Market
http://www.steamcardexchange.net/index.php?gamepage-appid-'+id																			Steam Card Exchange
http://steamcommunity.com/id/carlos-/gamecards/'+id+'?border=0'+(isFoil?1:0)															Togle Foil
*/
