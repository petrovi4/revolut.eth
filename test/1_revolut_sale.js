var RVLToken = artifacts.require("./RVLToken.sol");
var RVLSale = artifacts.require("./RVLSale.sol");

contract('RVLSale - Initialize, cap and simple transfer', async (accounts) => {

	let sale;

	let token_address;
	let token;

	const account_buyer = accounts[1];

	const etherToSend = 1;
	const tokensToBuy = web3.toWei(etherToSend);


	it('Init', async () => {
		sale = await RVLSale.deployed();

		token_address = await sale.token.call()
		token = await RVLToken.at(token_address);
	});


	it('Buy some tokens', async () => {
		const balanceBefore = await token.balanceOf.call(account_buyer);
		assert.equal(balanceBefore.toNumber(), 0, 'Wrong initial balance');

		await sale.sendTransaction({from: account_buyer, value: web3.toWei(etherToSend, 'ether')});

		const balanceAfter = await token.balanceOf.call(account_buyer);
		assert.equal(balanceAfter.toNumber(), tokensToBuy, 'Wrong account balance after buying');

		const totalSupply = await token.totalSupply.call();
		assert.equal(totalSupply.toNumber(), tokensToBuy, 'Wrong totalSupply amount');
	});

});


