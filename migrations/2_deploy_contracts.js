var RVLCoin = artifacts.require("./RVLCoin.sol");
var RVLCrowdsale = artifacts.require("./RVLCrowdsale.sol");

module.exports = function(deployer) {
	deployer.deploy(RVLCoin);
	deployer.deploy(RVLCrowdsale);
};
