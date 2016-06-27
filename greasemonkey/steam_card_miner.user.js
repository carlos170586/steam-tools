// ==UserScript==
// @name        Steam Card Miner
// @namespace   steamcardminer
// @include     //store.steampowered.com/explore/
// @include     //store.steampowered.com/app/*
// @version     1
// @grant       none
// ==/UserScript==

/*
Use this script in summer and winter sales.
this script auto click in the game pages to get all cards
*/

$J(document).ready(function(){
	$J('#refresh_queue_btn').click();
	$J('.btn_grey_white_innerfade.btn_medium').click();
	$J('.btn_next_in_queue').click();
});
