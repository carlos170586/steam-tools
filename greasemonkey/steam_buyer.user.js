// ==UserScript==
// @name           [Steam] Buyer
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Quickly buy items on steam market
// @include        http://steamcommunity.com/market/listings/*
// @version        1
// @grant          none
// ==/UserScript==

/*
steamMarket Script
*/
(function(){
	var Log=function(t){$J('#botLog').append('<br>'+t)},
		clearLog=function(t){$J('#botLog').html(t)};

	var s,
		Delay=500,
		cache=true,
		autobuyCount=0,
		lastIDmarket=new Array(10),//prevent try to buy same item
		lastTry=0;

	$J('#market_buynow_dialog_accept_ssa').prop('checked',true);

	function calculateNextCall(){
		//console.log(Delay);
		d=(lastTry+Delay)-(new Date).getTime();
		lastTry=new Date().getTime()+(d<0?0:d);
		setTimeout(autoBuyCheck,d<0?0:d);
		return;
	}

	function autoBuyCheck(){
		if(s[0]<1 || s[1]<1 || g_rgWalletInfo['wallet_balance']<s[0])
			return;

		$J.ajax({
			type: 'GET',
			cache:cache,
			url:window.location.href.split('?')[0]+'/render/?query=&start=0&count=10&country='+g_strCountryCode+'&language='+g_strLanguage+'&currency='+(typeof( g_rgWalletInfo ) != 'undefined' ? g_rgWalletInfo['wallet_currency'] : 1),
		}).done(function(d,textStatus,request){
			autobuyCount++;
			$J('#autobuyCount').html(autobuyCount);
			if(!d.success)
				return calculateNextCall();

			var item;
			$J.each(d.listinginfo,function(i,o){
				if(!item && (o.converted_price+o.converted_fee)>0 && $J.inArray(o.listingid,lastIDmarket)<0)
					item=o;
			});

			if(!item)
				return calculateNextCall();

			var precio=(item.converted_price+item.converted_fee);
			lastIDmarket.push(item.listingid);
			lastIDmarket.shift();
			//console.log(lastIDmarket);
			if(precio<=s[0]){
				Log('Trying to buy for '+v_currencyformat(precio,GetCurrencyCode(g_rgWalletInfo['wallet_currency']))+': <span id="item'+item.listingid+'"></span>');
				
				$J.ajax( {
					url: 'https://steamcommunity.com/market/buylisting/' + item.listingid,
					type: 'POST',
					data: {
						sessionid: g_sessionID,
						currency: g_rgWalletInfo['wallet_currency'],
						subtotal: item.converted_price,
						fee: item.converted_fee,
						total: item.converted_fee+item.converted_price,
						quantity: 1
					},
					crossDomain: true,
					xhrFields: { withCredentials: true }
				}).done(function (d){
					$J('#item'+item.listingid).append('<b style="color:green">OK</b>');
					s[1]--;
				}).fail( function(r){
					$J('#item'+item.listingid).append('<b style="color:red" title="'+r.message+'">Problem</b>');
				}).always( function(r){
					return calculateNextCall();
				});
			}else
				return calculateNextCall();
		}).fail( function(r){
			return calculateNextCall();
		});
	}

	$J(document).ready(function(){
		if(!$J('.market_commodity_order_block').length){
			//setInterval(function(){if(nextTry+2000<(new Date()).getTime())setTimeout(autoBuyCheck,Delay)},1000);
			$J('#largeiteminfo_content').append('<form id=autobuy>\
				<input style="width:100%" type=text placeholder="Price">\
				<input style="width:100%" type=text placeholder="Quantity">\
				<input id=delay title="Delay in miliseconds (min 250/max 2500)" style="width:100%" type=range min=0 max=2500 step=50 value='+Delay+' placeholder="Delay (Miliseconds)">\
				<input class="btn_green_white_innerfade btn_medium_wide" type=submit value="Autobuy!">\
			</form><div id=botLog></div>');

			$J('#autobuy').submit(function(e){
				e.preventDefault();
				s=[GetPriceValueAsInt($J('#autobuy input:eq(0)').val()),$J('#autobuy input:eq(1)').val()?parseInt($J('#autobuy input:eq(1)').val()):0];
				clearLog('<br>(<b><span id=autobuyCount>0</span></b>) Init... '+s[1]+' '+$J('#largeiteminfo_item_name').text()+' up to '+v_currencyformat(s[0],GetCurrencyCode(g_rgWalletInfo['wallet_currency'])));
				setTimeout(calculateNextCall,0);
				$J('#autobuy .btn_green_white_innerfade').hide();
			});
			$J('#delay').change(function(e){
				Delay=parseInt($J('#delay').val());
			});
		}
	});
})();