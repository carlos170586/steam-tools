// ==UserScript==
// @name           [Steam] Link Filter
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Remove link filters
// @include        /http[s]?:\/\/[www]?steamcommunity.com\/.+/
// @updateURL      https://github.com/carlos170586/steam-tools/raw/master/greasemonkey/steam_link_filter.user.js
// @version        1
// @grant          none
// ==/UserScript==

(function(){
	$J(document).ready(function(){
		$J('a[href^="https://steamcommunity.com/linkfilter/?url="]').each(function(){
			$J(this).attr('href',$J(this).attr('href').replace('https://steamcommunity.com/linkfilter/?url=',''));
		});
	});
})();