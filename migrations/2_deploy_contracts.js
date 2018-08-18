var RVLToken = artifacts.require("./RVLToken.sol");
var RVLSale = artifacts.require("./RVLSale.sol");

var Revolut = artifacts.require("./Revolut.sol");

// const duration = {
// 	seconds: function (val) { return val},
// 	minutes: function (val) { return val * this.seconds(60) },
// 	hours: function (val) { return val * this.minutes(60) },
// 	days: function (val) { return val * this.hours(24) },
// 	weeks: function (val) { return val * this.days(7) },
// 	years: function (val) { return val * this.days(365)}
// }

module.exports = function(deployer, network, accounts) {

	// const _openingTime = web3.eth.getBlock('latest').timestamp + duration.minutes(5)
	// const _closingTime = _openingTime + duration.minutes(10)

	deployer.deploy([
		[RVLToken],
		[RVLSale, accounts[5]],
		[Revolut],
	]);
};
