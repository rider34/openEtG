"use strict";
var fs = require("fs");
exports.prepuser = function(servuser){
	["gold", "daily", "dailymage", "dailydg", "aiwins", "ailosses", "pvpwins", "pvplosses", "ocard"].forEach(function(field){
		servuser[field] = parseInt(servuser[field] || 0, 10);
	});
}
exports.mkTask = function(cb){
	var params = {}, cbCount = 1;
	function cbCheck(){
		if (--cbCount == 0){
			cb(params);
		}
	}
	return function(param){
		if (arguments.length == 0){
			cbCheck();
		}else{
			cbCount++;
			return function(err, res){
				params[param] = res;
				if (err){
					if (!params.err) params.err = {};
					params.err[param] = err;
				}
				cbCheck();
			}
		}
	}
}
exports.initsalt = function(user){
	if (!user.salt){
		user.salt = require("crypto").pseudoRandomBytes(15).toString("base64");
		user.iter = 99999+Math.floor(Math.random()*9999);
	}
}
exports.useruser = function(db, servuser, cb){
	var task = exports.mkTask(function(results){
		cb({
			auth: servuser.auth,
			name: servuser.name,
			selectedDeck: servuser.selectedDeck,
			pool: servuser.pool,
			accountbound: servuser.accountbound,
			gold: servuser.gold,
			ocard: servuser.ocard,
			freepacks: servuser.freepacks,
			aiwins: servuser.aiwins,
			ailosses: servuser.ailosses,
			pvpwins: servuser.pvpwins,
			pvplosses: servuser.pvplosses,
			daily: servuser.daily,
			dailymage: servuser.dailymage,
			dailydg: servuser.dailydg,
			decknames: results.decks,
			quest: results.quest,
			quickdecks: results.quickdecks,
		});
	});
	db.hgetall("Q:" + servuser.name, task("quest"));
	db.hgetall("D:" + servuser.name, task("decks"));
	db.lrange("N:" + servuser.name, 0, -1, task("quickdecks"));
	task();
}
exports.getDay = function(){
	return Math.floor(Date.now()/86400000);
}
exports.parseJSON = function(x){
	try{
		return JSON.parse(x);
	}catch(e){
		return null;
	}
}