// ==UserScript==
// @name           [Steam] Seller
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Quickly sell items on steam market
// @include        http://steamcommunity.com/id/*/inventory*
// @include        http://steamcommunity.com/profiles/*/inventory*
// @updateURL      https://github.com/carlos170586/steam-tools/raw/master/greasemonkey/steam_seller.user.js
// @version        2
// @grant          none
// ==/UserScript==

Array.prototype.next = function() {
    if (!((this.current + 1) in this)) return false;
    return this[++this.current];
};
Array.prototype.current = 0;
(function(){
	var Log=function(t){$J('#vendeLog').append('<br>'+t)},
		clearLog=function(t){$J('#vendeLog').html(t)},

		itemlist=[];


	function getPriceFreeFees(item,nAmount){
		/*
		http://steamcommunity-a.akamaihd.net/public/javascript/economy.js?v=IjKB6GcwQUcX&l=spanish
		OnBuyerPriceInputKeyUp();
		*/
		var publisherFee = typeof item.market_fee != 'undefined' ? item.market_fee : g_rgWalletInfo['wallet_publisher_fee_percent_default'];
		var feeInfo = CalculateFeeAmount( nAmount, publisherFee );
		return nAmount - feeInfo.fees;
	}

	function sell(item){
		if(!item)
			return;
		//alert(item + ' + precio + '  +getPriceFreeFees(item,precio))
		$J.ajax({
			url: 'https://steamcommunity.com/market/sellitem/',
			type: 'POST',
			data: {
				sessionid: g_sessionID,
				appid: item.appid,
				contextid: item.contextid,
				assetid: item.id,
				amount: 1,
				price: getPriceFreeFees(item,precio)
			},
			crossDomain: true,
			xhrFields: {withCredentials: true}
		}).done(function(d){
			$J('#vendeitem'+item.id).text('OK');
		}).fail(function(d){
			$J('#vendeitem'+item.id).text('Problem.');
		}).always(function(d){
			sell(itemlist.next());
		});
	}

	function sellItems(precio){
		clearLog('Calculating prices...');
		itemlist=[];
		$J('.itemHolder .item:visible').each(function(){
			var matches = this.id.split("_");
			matches[0]=matches[0].replace("item","");
			var wea=g_rgAppContextData[matches[0]].rgContexts[matches[1]].inventory.rgInventory[matches[2]];
			if(wea.marketable){
				Log('Sell '+wea.market_name+' '+v_currencyformat( precio, GetCurrencyCode( g_rgWalletInfo['wallet_currency']) )+' ('+v_currencyformat( getPriceFreeFees(wea,precio), GetCurrencyCode( g_rgWalletInfo['wallet_currency']) )+')? <b id=vendeitem'+matches[2]+'></b>');
				itemlist.push(wea);
			}
		}).promise().done(function(){
			$J('.confirmVenta').show();
		});
	}



	function ConvertTaricGems(item){
		if(!item)
			return alert('More than just precious stones, I bring you an ancient power (gems converted).');
		if(!item.Gems)
			ConvertTaricGems(itemlist.next());
		//alert(item + ' + precio + '  +getPriceFreeFees(item,precio))
		$J.ajax( {
			url: 'http://steamcommunity.com/id/carlos-/ajaxgrindintogoo/',
			type: 'POST',
			data: {
				sessionid: g_sessionID,
				appid: item.appid,
				contextid: item.contextid,
				assetid: item.id,
				goo_value_expected: item.Gems
			},
			crossDomain: true,
			xhrFields: {withCredentials:true }
		}).always(function(d){
			ConvertTaricGems(itemlist.next());
		});
	}

	function checkGemPrices(item){
		if(!item){
			itemlist.current=0;
			$J('.confirmTaricGems').show();
			return;
		}
		//alert(item + ' + precio + '  +getPriceFreeFees(item,precio))
		$J.ajax( {
			url: 'http://steamcommunity.com/id/carlos-/ajaxgetgoovalue/',
			type: 'GET',
			data: {
				sessionid: g_sessionID,
				appid: item.appid,
				contextid: item.contextid,
				assetid: item.id
			},
			crossDomain: true,
			xhrFields: { withCredentials: true }
		} ).done( function ( data ) {
			$J('#vendeitem'+item.id).text(data.goo_value+' gems');
			itemlist[itemlist.current].Gems=data.goo_value;
			checkGemPrices(itemlist.next());
		} ).fail( function( jqxhr ) {
			$J('#vendeitem'+item.id).text('Cant convert.');
			checkGemPrices(itemlist.next());
		} );
	}

	function TaricGems(){
		clearLog('Calculating gem prices...');
		itemlist=[];
		$J('.itemHolder .item:visible').each(function(){
			var matches = this.id.split("_");
			matches[0]=matches[0].replace("item","");
			if(matches[1]==6){
				var wea=g_rgAppContextData[matches[0]].rgContexts[matches[1]].inventory.rgInventory[matches[2]];
				Log('Convert '+wea.market_name+' will result in <span id=vendeitem'+matches[2]+'>...</span>');
				itemlist.push(wea);
			}
		}).promise().done(function(){
			checkGemPrices(itemlist[0]);
		});
	}


	$J(document).ready(function(){
		if($J('#global_actions .user_avatar a').attr('href')!=$J('.profile_small_header_bg .profile_small_header_name a').attr('href'))
			return;
		$J('#inventory_logos').css('height','auto');
		$J('#inventory_applogo').after('<div id=vendeLog></div>\
		<a class="btn_green_white_innerfade btn_medium_wide confirmVenta" style="display:none"><span>Confirm</span></a>\
		<a class="btn_green_white_innerfade btn_medium_wide confirmTaricGems" style="display:none"><span>Confirm</span></a>\
		<div style="display: inline-block; line-height: 69px; vertical-align: top; margin-left: 15px;">\
		<input type=text value=0 id="precio">\
		<a class="btn_green_white_innerfade btn_medium_wide venderItems"><span>Sell visible items</span></a>\
		<a class="btn_green_white_innerfade btn_medium_wide TaricGems"><span>Convert into Gems</span></a>\
		</div>');

		$J('.venderItems').click(function(){
			precio=GetPriceValueAsInt($J('#precio').val());
			if(precio>0)
				sellItems(precio);
		});
		$J('.confirmVenta').click(function(){
			$J('.confirmVenta').hide();
			sell(itemlist[0]);
		});
		$J('.TaricGems').click(function(){
			TaricGems();
		});
		$J('.confirmTaricGems').click(function(){
			ConvertTaricGems(itemlist[0]);
			$J('.confirmTaricGems').hide();
		});
	});
})();



