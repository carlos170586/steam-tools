// ==UserScript==
// @name           [Steam] Check Bans
// @namespace      https://github.com/carlos170586/steam-tools/
// @description    Check Bans on friendlist, recently played and blocked users.
// @include        *//steamcommunity.com/id/*/friends/*
// @version        1
// @grant          none
// ==/UserScript==

//based on https://github.com/MrHayato/VacBanChecker/blob/master/vaccheck.js

(function(){
	var api		='7155C5B195F128FF3E862A58AE069464',
		bussy	=0,
		lookup	={};

	function steam_id(id){
		return id.length===17?(id.substr(3)-61197960265728):('765'+(parseInt(id)+61197960265728));
	}

	function CheckBans(player){
		lookup[player.SteamId].forEach(function(block) {
			var inGameText = $J('.linkFriend_in-game',block);

			var span = document.createElement('span');
			span.style.fontWeight = 'bold';
			span.style.display = 'block';

			if($J('.linkFriend_in-game',block).length)
				$J('.linkFriend_in-game',block).html($J('.linkFriend_in-game',block).html().split('<br>')[1]);

			if(player.NumberOfVACBans || player.NumberOfGameBans || player.CommunityBanned || player.EconomyBan!=="none"){
				var t='';

				if(player.NumberOfGameBans)
					t+= player.NumberOfGameBans + ' GameBanned';
				if(player.NumberOfVACBans)
					t+=(t===''?'':', ')+player.NumberOfVACBans+' VACBanned '+player.DaysSinceLastBan + ' days ago';

				if(player.EconomyBan!=="none")
					t+=' Economy '+player.EconomyBan+'.';
				if(player.CommunityBanned)
					t+=' Community Banned.';

				span.innerHTML =t;
				span.style.color = 'rgb(255, 73, 73)';
			}else{
				span.style.color = 'rgb(43, 203, 64)';
				span.innerHTML = 'No Bans for this player';
			}

			$J('.friendSmallText',block).append(span);
			bussy--;
		});
	}

	function makeApiCall(ids) {
		$J.ajax('https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key='+api+'&steamids='+ids.join(',')).always(function(d){
			d.players.forEach(CheckBans);
		});
	}

	$J(".manage_friends_btn_ctn").prepend('<span id=BanChecker class="btn_grey_black btn_details btn_small"><span>Check Bans <span class="btn_details_arrow down"></span></span></span>');
	$J("#BanChecker").click(function(){
		if(bussy)return;

		$J('.friendBlock').each(function(){
			var id=steam_id($J(this).data('miniprofile'));
			if(!lookup[id])
				lookup[id]=[];
			lookup[id].push($J(this));
		})

		var ids=Object.keys(lookup);
		while(ids.length>0){
			var batch=ids.splice(0, 100);
			makeApiCall(batch);
		}
	});
})();
