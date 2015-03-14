// ==UserScript==
// @name           [Steam] Market Info
// @namespace      https://github.com/carlos170586/steam-tools
// @description    Extra info about your market history
// @include        http://steamcommunity.com/market/
// @version        1
// @grant          none
// ==/UserScript==

/*
http://steamrep.com/profiles/76561198065598820
https://steamdb.info/calculator/?player=76561198065598820
http://steam.tools/itemvalue/#/76561198065598820-730
http://steam.tools/cards/
http://www.steamcardexchange.net/index.php?gamepage-appid-42160
http://steamcommunity.com/market/search?category_753_Game[]=tag_app_550&category_753_cardborder[]=tag_cardborder_1&category_753_item_class[]=tag_item_class_2&appid=753
*/

(function(){//display the total value of all your items
	var marketBot=[0,0,0];
	$J('.my_listing_section.market_home_listing_table:eq(0) .market_listing_row.market_recent_listing_row').each(function(){
		var listingAmount=$J('.market_listing_item_name_link',this).attr('href')=='http://steamcommunity.com/market/listings/753/753-Sack%20of%20Gems'?parseInt($J('.market_listing_item_name_link',this).text().split(' ')[0]):1;
		marketBot[0]+=listingAmount;
		marketBot[1]+=(listingAmount*GetPriceValueAsInt($J('.market_listing_price>span>span:eq(0)',this).text()));
		marketBot[2]+=(listingAmount*GetPriceValueAsInt($J('.market_listing_price>span>span:eq(1)',this).text().replace('(','')));
	}).promise().done(function(){
		var html='<div class="market_listing_row market_recent_listing_row">\
			<div class="market_listing_right_cell market_listing_edit_buttons"><div class="market_listing_cancel_button"><a class="item_market_action_button item_market_action_button_edit nodisable"><span class="item_market_action_button_contents cancelAllPlease">Cancel All</span></a></div></div>\
			<div class="market_listing_right_cell market_listing_my_price"><span class="market_table_value"><span class="market_listing_price">'+v_currencyformat(marketBot[1],GetCurrencyCode(g_rgWalletInfo['wallet_currency']))+'<br> '+(marketBot[2]>0?'<span style="color: #AFAFAF">('+v_currencyformat(marketBot[2],GetCurrencyCode(g_rgWalletInfo['wallet_currency']))+')</span>':'')+'</span></span></div>\
			<div class="market_listing_right_cell market_listing_my_price"><span class="market_table_value"><span class="market_listing_price">'+marketBot[0]+' items</span></span></div>\
			<div style="clear: both"></div>\
			</div>';
		if(marketBot[0]>0)
			$J('.my_listing_section.market_home_listing_table:eq(0)').append(html);
		if(marketBot[0]>15)
			$J('.my_listing_section.market_home_listing_table:eq(0) .market_listing_table_header').after(html);
	});
	$J('.cancelAllPlease').click(function(){
		var removePLS=[],
			rmv=function(id){
			if(!id)
				return;
			$J.ajax( {
				url: 'http://steamcommunity.com/market/removelisting/'+id,
				type: 'POST',
				data: {
					sessionid: g_sessionID
				},
				crossDomain: true,
				xhrFields:{withCredentials:true}
			}).always(function(d){
				$J('.my_listing_section.market_home_listing_table:eq(0) .market_listing_row.market_recent_listing_row').first().remove();
				rmv(removePLS.shift());
			});
		};
		$J('.my_listing_section.market_home_listing_table:eq(0) .market_listing_row.market_recent_listing_row').each(function(){
			if($J(this).attr('id'))
				removePLS.push($J(this).attr('id').split('_')[1]);
		}).promise().done(function(){
			rmv(removePLS.shift());
		});
		$J('.my_listing_section.market_home_listing_table:eq(0) .market_listing_row.market_recent_listing_row:has(.cancelAllPlease)').remove();
	});
})();

(function(){//display info about all your transactions
	$J('#moreInfo').before('<div><div class="market_search_sidebar_contents">\
		<h2 class="market_section_title">Transactions</h2>\
		<div id="MarketTrans2">\
			<a class="btn_green_white_innerfade btn_medium_wide"><span>Check</span></a>\
		</div>\
		</div></div>');

	$J('#MarketTrans2 a').click(function(){
		var pagesize=500,
			marketTrans=[0,0,0,0,0,0],
			page=0,
			totalActions=0,
		
			getNextPage=function(){
			if(page*pagesize>totalActions)
				return publishData();

			$J.ajax( {
				url: 'http://steamcommunity.com/market/myhistory/render/',
				type: 'GET',
				data: {
					query: '',
					start: page*pagesize,
					count: pagesize
				},
				crossDomain: true,
				xhrFields:{withCredentials:true}
			}).done(function(d){
				if(d && d.results_html){
					totalActions=d.total_count;
					page++;
					proxessResults('<div>'+d.results_html+'</div>');
					$J('#loadingTrans').html(page+'/'+parseInt(totalActions/500));
				}
				getNextPage();
			}).fail(function(r){
				getNextPage();
			});
		},
			proxessResults=function(d){
			$J('.market_recent_listing_row',d).each(function(){
				var w=$J.trim($J('.market_listing_gainorloss',this).text());
				if(w!=''){
					var s=w=='+'?0:1,
						p=GetPriceValueAsInt($J('.market_listing_price',this).text());
					marketTrans[s]++;
					marketTrans[2+s]+=p;
					marketTrans[4+s]=Math.max(marketTrans[4+s],p);
				}
			});
		},
			publishData=function(){
			$J('#MarketTrans2').html('\
				<style>\
					#MarketTrans2{display:table;width:100%}\
					#MarketTrans2>div{display:table-row}\
					#MarketTrans2>div>div{display:table-cell;width:50%}\
				</style>\
				<div><div>Total Purchases:</div><div>'+v_currencyformat(marketTrans[2],GetCurrencyCode(g_rgWalletInfo['wallet_currency']))+'</div></div>\
				<div><div>Total Sales:</div><div>'+v_currencyformat(marketTrans[3],GetCurrencyCode(g_rgWalletInfo['wallet_currency']))+'</div></div>\
				<hr>\
				<div><div>Net gains:</div><div style="color:'+(marketTrans[3]-marketTrans[2]<0?'red':'green')+'">'+v_currencyformat(marketTrans[3]-marketTrans[2],GetCurrencyCode(g_rgWalletInfo['wallet_currency']))+'</div></div>\
				<br>\
				<div><div>Purchases:</div><div>'+marketTrans[0]+'</div></div>\
				<div><div>Sales:</div><div>'+marketTrans[1]+'</div></div>\
				<div><div>Biggest Purchase:</div><div>'+v_currencyformat(marketTrans[4],GetCurrencyCode(g_rgWalletInfo['wallet_currency']))+'</div></div>\
				<div><div>Biggest Sale:</div><div>'+v_currencyformat(marketTrans[5],GetCurrencyCode(g_rgWalletInfo['wallet_currency']))+'</div></div>\
			');
		};
		$J('#MarketTrans2').html('Loading... <span id=loadingTrans></span>');
		getNextPage();
	});
})();