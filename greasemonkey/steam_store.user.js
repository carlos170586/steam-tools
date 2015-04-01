// ==UserScript==
// @name           [Steam] Store
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Useful tricks
// @include        http://store.steampowered.com/*
// @updateURL      https://github.com/carlos170586/steam-tools/raw/master/greasemonkey/steam_store.user.js
// @version        1
// @grant          none
// ==/UserScript==

(function(){
	function CookCookies(){
		document.cookie='lastagecheckage=1-January-1988; expires=Fri, 31 Dec 2049 23:59:59 GMT; path=/'
	}
	function checkDRM(){
		if($J('.DRM_notice:contains("DRM")').length){
			$J('#purchase_note').length || $J('#game_area_purchase').prepend('<div id="purchase_note"><div class="notice_box_top"></div><div class="notice_box_bottom"></div></div>');
			$J('#purchase_note .notice_box_bottom').before('<div class="notice_box_content"><b>Notice:</b> This app contain 3rd part DRM.</div>');
		}
	}

	$J(document).ready(function(){
		if(location.href.match(/http:\/\/store.steampowered.com\/app\/.+/))
			checkDRM();
		CookCookies();
	});
})();