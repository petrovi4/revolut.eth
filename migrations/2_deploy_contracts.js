var RVLToken = artifacts.require("./RVLToken.sol");
var RVLSale = artifacts.require("./RVLSale.sol");

var Revolut = artifacts.require("./Revolut.sol");



module.exports = function(deployer, network, accounts) {

	deployer.deploy(RVLSale, accounts[5]).then((sale) => {
		return sale.token.call();
	}).then((token_address) => {
		return deployer.deploy(Revolut, token_address);
	});
};
