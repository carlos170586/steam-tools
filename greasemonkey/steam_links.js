// ==UserScript==
// @name           [Steam] Links
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Add usefull links to Steam menu and profiles
// @include        http://steamcommunity.com/*
// @include        http://store.steampowered.com/*
// @version        1
// @grant          none
// ==/UserScript==

(function(){
	var profileURL=$J('#global_actions .playerAvatar a').attr('href'),
	profileLinks=[//Profile links
		['SteamTools','http://steam.tools/itemvalue/#/'+g_rgProfileData.steamid+'-753'],
		['SteamDB','https://steamdb.info/calculator/'+g_rgProfileData.steamid],
		['SteamREP','http://steamrep.com/profiles/'+g_rgProfileData.steamid],
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
	}

	function addProfileLinks(){
		var m='';
		for(var x=0;x<profileLinks.length;x++)
			m+='<div class="profile_count_link"><a href="'+profileLinks[x][1]+'"><span class="count_link_label">'+profileLinks[x][0]+'</span></a></div>';
		$J('.profile_group_links').before('<div class="profile_useful_links" style="margin-bottom:40px">'+m+'</div>')
	}

	$J(document).ready(function(){
		addHeaderLinks();
		location.href.match(/http:\/\/steamcommunity.com\/(id|profiles)\/.+/) && addProfileLinks();
	});
})();