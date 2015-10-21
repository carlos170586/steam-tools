// ==UserScript==
// @name           [Steam] Seller
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Quickly sell items on steam market
// @include        /http[s]?:\/\/[www]?steamcommunity.com\/id/[^\/]+/inventory.+/
// @include        http://steamcommunity.com/profiles/*/inventory*
// @updateURL      https://github.com/carlos170586/steam-tools/raw/master/greasemonkey/steam_seller.user.js
// @version        3
// @grant          none
// ==/UserScript==

Array.prototype.next = function() {
    if (!((this.current + 1) in this)) return false;
    return this[++this.current];
};
Array.prototype.current = 0;
(function(){
	var Log=function(t){$J('#SteamSellerLog').append('<br>'+t)},
		clearLog=function(t){$J('#SteamSellerLog').html(t)},

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






	function SellAll(minPrice,minVol){
		clearLog('Collecting Data...');
		itemlist=[];
		var ngi=[0,0];
		var appid=$J('.games_list_tabs .active')[0].hash.replace(/^#/, ''),
			rgC=g_rgAppContextData[appid].rgContexts;
		for(var x in rgC){
			var rgI=rgC[x].inventory.rgInventory;
			for(var x2 in rgI){
				if(rgI[x2].marketable){
					ngi[0]++;
					$J.ajax({
						url:'http://steamcommunity.com/market/priceoverview/',
						type:'GET',
						item:rgI[x2],
						data:{
							country: g_rgWalletInfo.wallet_country,
							currency: g_rgWalletInfo.wallet_currency,
							appid:appid,
							market_hash_name:rgI[x2].market_hash_name
						},
						crossDomain: true,
						xhrFields: { withCredentials: true }
					}).done(function(d){
						if(!d.lowest_price || !d.median_price || !d.volume || d.volume<minVol)
							return;
						var lP=GetPriceValueAsInt(d.lowest_price),
							mP=GetPriceValueAsInt(d.median_price),
							sP=0;
						
						if(lP>mP){
							sP=lP;
						}else if(lP<mP){
							sP=mP+parseInt((mP-lP)/2);
						}else{
							sP=d.volume<10?lP:lP+1;
						}
						if(sP<minPrice)
							return;
						this.item.price=sP;
						itemlist[itemlist.length]=this.item;
						Log('Sell '+this.item.market_name+' '+v_currencyformat(this.item.price, GetCurrencyCode( g_rgWalletInfo['wallet_currency']) )+' ('+v_currencyformat( getPriceFreeFees(this.item,this.item.price), GetCurrencyCode( g_rgWalletInfo['wallet_currency']) )+')? <b id=vendeitem'+this.item.id+'></b>');
					}).always(function(){
						ngi[1]++;
						if(ngi[0]==ngi[1])
							$J('.confirm').show();
					});
				}
			}
		}
	}

	function SellVisibles(price){
		clearLog('Calculating prices...');
		itemlist=[];
		$J('.itemHolder .item:visible').each(function(){
			var matches = this.id.split("_");
			matches[0]=matches[0].replace("item","");
			var wea=g_rgAppContextData[matches[0]].rgContexts[matches[1]].inventory.rgInventory[matches[2]];
			if(wea.marketable){
				Log('Sell '+wea.market_name+' '+v_currencyformat(price, GetCurrencyCode( g_rgWalletInfo['wallet_currency']) )+' ('+v_currencyformat( getPriceFreeFees(wea,price), GetCurrencyCode( g_rgWalletInfo['wallet_currency']) )+')? <b id=vendeitem'+matches[2]+'></b>');
				wea.price=price;
				itemlist.push(wea);
			}
		}).promise().done(function(){
			$J('.confirm').show();
		});
	}

	function sellItem(item){
		if(!item)
			return;
		$J.ajax({
			url: 'https://steamcommunity.com/market/sellitem/',
			type: 'POST',
			data: {
				sessionid: g_sessionID,
				appid: item.appid,
				contextid: item.contextid,
				assetid: item.id,
				amount: 1,
				price: getPriceFreeFees(item,item.price)
			},
			crossDomain: true,
			xhrFields: {withCredentials: true}
		}).done(function(d){
			$J('#vendeitem'+item.id).text('OK');
		}).fail(function(d){
			$J('#vendeitem'+item.id).text('Problem ('+item.market_name+').');
		}).always(function(d){
			sellItem(itemlist.next());
		});
	}







	function CalculateVisibleGems(){
		clearLog('Calculating gem prices...');
		itemlist=[];
		var ngi=[0,0];
		$J('.itemHolder .item:visible').each(function(){
			var matches = this.id.split("_");
			matches[0]=matches[0].replace("item","");
			if(matches[1]==6){
				var lid=itemlist.length;
				itemlist[lid]=g_rgAppContextData[matches[0]].rgContexts[matches[1]].inventory.rgInventory[matches[2]];
				Log('Convert '+itemlist[lid].market_name+' will result in <span id=vendeitem'+matches[2]+'>...</span>');
				ngi[0]++;

				$J.ajax({
					url:$J('#global_actions .user_avatar a').attr('href')+'/ajaxgetgoovalue/',
					type:'GET',
					lid:lid,
					data:{
						sessionid: g_sessionID,
						appid: itemlist[lid].appid,
						contextid: itemlist[lid].contextid,
						assetid: itemlist[lid].id
					},
					crossDomain: true,
					xhrFields: { withCredentials: true }
				}).done(function(d){
					$J('#vendeitem'+itemlist[this.lid].id).text(d.goo_value+' gems');
					itemlist[this.lid].Gems=d.goo_value;
				}).fail(function(jqxhr){
					$J('#vendeitem'+itemlist[this.lid].id).text('Cant convert.');
				}).always(function(){
					ngi[1]++;
					if(ngi[0]==ngi[1])
						$J('.confirm').show();
				});
			}
		});
	}

	function CalculateGems(){
	}

	function convertIntoGems(item){
		if(!item)
			return Log('Gems converted.');
		if(!item.Gems)
			convertIntoGems(itemlist.next());
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
		}).done(function(d){
			$J('#vendeitem'+item.id).css({color:'green'});
		}).always(function(d){
			convertIntoGems(itemlist.next());
		});
	}

	$J(document).ready(function(){

		if($J('#global_actions a.user_avatar').attr('href')!=$J('.profile_small_header_bg .profile_small_header_name a').attr('href')+'/')
			return;
		$J('#inventory_logos').css('height','auto');
		$J('#inventory_applogo').after('<div id=SteamSeller style="line-height:45px;margin:10px">\
			<label><input type="radio" name="sellType" value=0>Sell All</label>\
			<label><input type="radio" name="sellType" value=1 checked>Sell Visibles</label>\
			<!--<label><input type="radio" name="sellType" value=2>Convert All into Gems</label>-->\
			<label><input type="radio" name="sellType" value=3>Convert Visibles into Gems</label>\
			\
			<div id=SteamSellerLog style="line-height:normal"></div>\
			<a class="btn_green_white_innerfade btn_medium_wide confirm" style="display:none"><span>Confirm</span></a>\
			\
			<div class="sellType s0">\
				<label title="Only sell items if the price is highest than the minimun price">Minnimun Price:<input type=text value='+v_currencyformat(6)+' id="minimunPrice"> '+GetCurrencyCode(g_rgWalletInfo['wallet_currency'])+'</label><br>\
				<label title="Only sell items if in last 24hours sold more units than Minimun volume">Minimun volume:<input type=text value=10 id="minimunVol"></label><br>\
				<a class="btn_green_white_innerfade btn_medium_wide SteamSeller"><span>Sell all your trading cards</span></a>\
			</div>\
			<div class="sellType s1">\
				<label title="Price per item">Price: <input type=text value='+v_currencyformat(0)+' id="priceVisible"> '+GetCurrencyCode(g_rgWalletInfo['wallet_currency'])+'</label><br>\
				<a class="btn_green_white_innerfade btn_medium_wide SteamSeller"><span>Sell visible items</span></a>\
			</div>\
			<div class="sellType s2">\
				<a class="btn_green_white_innerfade btn_medium_wide SteamSeller"><span>Convert all cards into Gems</span></a>\
			</div>\
			<div class="sellType s3">\
				<a class="btn_green_white_innerfade btn_medium_wide SteamSeller"><span>Convert visible cards into Gems</span></a>\
			</div>\
		</div>');

		$J('.SteamSeller').click(function(){
			var o=$J('input[name="sellType"]:checked').val();
			if(o==0)
				SellAll(GetPriceValueAsInt($J('#minimunPrice').val()),parseInt($J('#minimunVol').val()));
			else if(o==1)
				SellVisibles(GetPriceValueAsInt($J('#priceVisible').val()))
			else if(o==2)
				CalculateGems();
			else if(o==3)
				CalculateVisibleGems();
		});

		$J('.confirm').click(function(){
			var o=$J('input[name="sellType"]:checked').val();
			if(o==0 || o==1)
				sellItem(itemlist[0]);
			if(o==2 || o==3)
				convertIntoGems(itemlist[0]);
			$J('.confirm').hide();
		});

		$J('input[name="sellType"]').change(function(){
			$J('.sellType,.confirm').hide();
			clearLog('');
			$J('.sellType.s'+$J('input[name="sellType"]:checked').val()).show();
		}).change();
	});
})();
