// ==UserScript==
// @name           [Steam] Rep
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Check all Steam prices
// @include        http://store.steampowered.com/app/*
// @require        http://steamcommunity-a.akamaihd.net/public/javascript/jquery-1.11.1.min.js?v=.isFTSRckeNhC
// @updateURL      https://github.com/carlos170586/steam-tools/raw/master/greasemonkey/steam_prices.user.js
// @version        1
// @grant          GM_xmlhttpRequest
// ==/UserScript==

(function(){
	CRates=[];
	
	
	function getConversionRates(){
		GM_xmlhttpRequest({
			method:"GET",
			url:'http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
			onload:function(r){
				$('Cube[currency]',r.responseText).each(function(){
					alert($(this).attr('currency'))
				});
			}
		});
	}
	function checkPrice(){
		getConversionRates();
	}
	$(document).ready(function(){
		checkPrice();
	});
})();