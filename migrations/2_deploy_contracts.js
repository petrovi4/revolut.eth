var RVLCoin = artifacts.require("./RVLCoin.sol");

module.exports = function(deployer) {
	const tokensAmount = 1e10;
  // deployer.deploy(RVLCoin, tokensAmount);
  deployer.deploy(RVLCoin);
};
