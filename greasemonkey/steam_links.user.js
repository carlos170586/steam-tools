// ==UserScript==
// @name           [Steam] Links
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Add usefull links to Steam menu and profiles
// @include        http://steamcommunity.com/*
// @include        http://store.steampowered.com/*
// @updateURL      https://github.com/carlos170586/steam-tools/raw/master/greasemonkey/steam_links.user.js
// @version        2
// @grant          none
// ==/UserScript==

(function(){
	var profileURL=$J('#global_actions .playerAvatar a,#global_actions a.playerAvatar').attr('href'),
	profileLinks=[//Profile links
		['SteamTools','http://steam.tools/itemvalue/#/{id}-753'],
		['SteamDB','https://steamdb.info/calculator/{id}'],
		['SteamREP','http://steamrep.com/profiles/{id}'],
	],
	headerLinks=[
		[//store menu
		],
		[//community menu
			['Old Forums',	'http://forums.steampowered.com/forums/']
		],
		[//profile menu
			['My Games',	profileURL+'/games/'],
			['My Reviews',	profileURL+'/recommended/'],
		],
	];

	function addHeaderLinks(){
		$J('#supernav a[data-tooltip-content]').each(function(i){
			var m='';
			for(var x=0;x<headerLinks[i].length;x++)
				m+='<a class="submenuitem" href="'+headerLinks[i][x][1]+'">'+headerLinks[i][x][0]+'</a>';
			$J(this).attr('data-tooltip-content',$J(this).attr('data-tooltip-content')+m)
		});
	};

	function addProfileLinks(){
		var m='';
		for(var x=0;x<profileLinks.length;x++)
			m+='<div class="profile_count_link"><a href="'+profileLinks[x][1].replace('{id}',g_rgProfileData.steamid)+'"><span class="count_link_label">'+profileLinks[x][0]+'</span></a></div>';
		$J('.profile_group_links').before('<div class="profile_useful_links" style="margin-bottom:40px">'+m+'</div>')
	}

	$J(document).ready(function(){
		addHeaderLinks();
		location.href.match(/http:\/\/steamcommunity.com\/(id|profiles)\/[^\/]+\/$/) && addProfileLinks();
	});
})();