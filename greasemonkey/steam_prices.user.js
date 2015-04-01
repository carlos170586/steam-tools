// ==UserScript==
// @name           [Steam] Prices
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Check all Steam prices
// @include        /http[s]?:\/\/[www]?store.steampowered.com\/app\/.+/
// @require        http://steamcommunity-a.akamaihd.net/public/javascript/jquery-1.11.1.min.js
// @updateURL      https://github.com/carlos170586/steam-tools/raw/master/greasemonkey/steam_prices.user.js
// @version        1
// @grant          GM_xmlhttpRequest
// ==/UserScript==

(function(){
	var countries=[
		'fr','it',																		// eur zones
		'us','uk','ru','br','jp','ca','tr','mx','no','sg','th','ph','id','my','nz',		// country currencies
		//'ua','ar'																		// country with US dollar currency
		],

		CRates={},
		prices={},
		myCurrency="EUR",
		myPrices={},
		completed=[];
	
	
	function CalculatePrices(app){
		completed[app]++;
		if(completed[app]==countries.length){
			var p=[],
				html='';
			for(var x in prices[app]){
			var europrice=prices[app][x].currency=='EUR'?prices[app][x].final:prices[app][x].final/CRates[prices[app][x].currency],
				converted_price=myCurrency=='EUR'?europrice:europrice*CRates[myCurrency];
				p.push([x,prices[app][x].currency,converted_price,prices[app][x].final,((converted_price/myPrices[app])*100-100).toFixed(2)]);
			}
			p.sort(function(a,b){return a[2]-b[2]});
			for(var x in p){
				html+='<div style="background-position:0 -'+countries.indexOf(p[x][0])*15+'px"><div>'+v_currencyformat(p[x][3],p[x][1])+'</div><div>'+v_currencyformat(p[x][2],myCurrency)+'</div><div style="color:'+(p[x][4]>1?'red':(p[x][4]<-1?'green':'yellow'))+'">'+p[x][4]+'%</div>'+'</div>';
			}
			$('#priceBox'+app).html(html);
		}
	}
	function getConversionRates(){
		GM_xmlhttpRequest({
			method:"GET",
			url:'http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
			onload:function(r){
				$('Cube[currency]',r.responseText).each(function(){
					CRates[$(this).attr('currency')]=$(this).attr('rate');
				});
			}
		});
	}
	function getMyPrices(app){
		$.ajax({
			method:"GET",
			url:'http://store.steampowered.com/api/packagedetails/',
			data:{'packageids':app}
		}).done(function(r){
			for(var x in r){
				myPrices[x]=r[x].data.price.final;
				myCurrency=r[x].data.price.currency;
			}
		}).fail(function(){
			//getMyPrices(app);
		});
	}
	function getPrices(app,cc){
		$.ajax({
			method:"GET",
			url:'http://store.steampowered.com/api/packagedetails/',
			data:{'packageids':app,'filters':'price_overview','cc':cc}
		}).done(function(r){
			for(var x in r){
				prices[x][cc]=r[x].data.price;
				CalculatePrices(x);
			}
		}).fail(function(){
			CalculatePrices(app);
			//getPrices(app,cc);
		});
	}


	function getCCPrices(app){
		//CRates.length || getConversionRates();
		prices[app]={};
		completed[app]=0;
		getMyPrices(app);
		for(var x in countries)
			getPrices(app,countries[x]);
	}

	$('.game_purchase_action_bg').on('mouseenter',function(){
		var $this=$(this),
			id=$('input[name="subid"]',$this.closest('.game_area_purchase_game')).val();
		if($('#priceBox'+id).length)
			$('#priceBox'+id).show();
		else{
			getCCPrices(id);
			$('body').append('<div id="priceBox'+id+'" class="priceBox" style="top:'+$this.offset().top+'px;left:'+$this.offset().left+'px;">Loading...</div>');
		}
	}).on('mouseleave',function(){
		$('.priceBox').hide();
	})
	$(document).ready(function(){
		getConversionRates();
		$('body').append('<style>\
		.priceBox{padding:8px;z-index:9999;position:absolute;border:1px solid #000;background:linear-gradient(135deg,rgb(48,50,51) 0%,rgb(97,100,101)100%);margin-top:35px;}\
		.priceBox>div{padding-left:16px;background:url(https://raw.githubusercontent.com/carlos170586/steam-tools/master/greasemonkey/images/flags.png)no-repeat}\
		.priceBox>div>div{width:85px;display:inline-block}\
		</style>');
	});
})();


 










//Steam functions


function v_currencyformat( valueInCents, currencyCode, countryCode )
{
	var currencyFormat = (valueInCents / 100).toFixed(2);
	switch( currencyCode )
	{
		case 'EUR':
			return (currencyFormat + GetCurrencySymbol( currencyCode )).replace( '.', ',' ).replace( ',00', ',--' );
		case 'GBP':
			return GetCurrencySymbol( currencyCode ) + currencyFormat;
		case 'USD':
			if ( typeof(countryCode) != 'undefined' && countryCode != 'US' )
				return GetCurrencySymbol( currencyCode ) + currencyFormat + ' USD';
			else
				return GetCurrencySymbol( currencyCode ) + currencyFormat;
		case 'RUB':
			return currencyFormat.replace( '.', ',' ).replace( ',00', '' ) + ' ' + GetCurrencySymbol( currencyCode );
		case 'JPY':
			return GetCurrencySymbol( currencyCode ) + ' ' + currencyFormat.replace( '.00', '' );
		case 'BRL':
			return GetCurrencySymbol( currencyCode ) + ' ' + currencyFormat.replace( '.', ',' );
		case 'NOK':
			return currencyFormat.replace( '.', ',' ) + ' ' + GetCurrencySymbol( currencyCode );
		case 'IDR':
			return GetCurrencySymbol( currencyCode ) + ' ' + currencyFormat;
		case 'MYR':
		case 'PHP':
		case 'SGD':
		case 'THB':
			return GetCurrencySymbol( currencyCode ) + currencyFormat;
		case 'KRW':
			return GetCurrencySymbol( currencyCode ) + currencyFormat.replace( '.00', '' );
		case 'MXN':
		case 'CAD':
		case 'AUD':
		case 'NZD':
			return GetCurrencySymbol( currencyCode ) + ' ' + currencyFormat;
		default:
			return currencyFormat + ' ' + currencyCode;
	}
}
function GetCurrencySymbol( currencyCode )
{
	switch( currencyCode )
	{
		case 'EUR':
			return '€';
		case 'GBP':
			return '£';
		case 'USD':
			return '$';
		case 'RUB':
			return 'руб';
		case 'BRL':
			return 'R$';
		case 'JPY':
			return '¥';
		case 'NOK':
			return 'kr';
		case 'IDR':
			return 'Rp';
		case 'MYR':
			return 'RM';
		case 'PHP':
			return '₱';
		case 'SGD':
			return 'S$';
		case 'THB':
			return '฿';
		case 'VND':
			return '₫';
		case 'KRW':
			return '₩';
		case 'TRY':
			return 'TL';
		case 'UAH':
			return '₴';
		case 'MXN':
			return 'Mex$';
		case 'CAD':
			return 'CDN$';
		case 'AUD':
			return 'A$';
		case 'NZD':			
			return 'NZ$';
		default:
			return currencyCode + ' ';
	}
}