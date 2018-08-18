var RVLCoin = artifacts.require("./RVLCoin.sol");
var RVLCrowdsale = artifacts.require("./RVLCrowdsale.sol");

contract('RVLCrowdsale - Initialize, cap and simple transfer', async (accounts) => {

	const account = accounts[1];

	const coinsToBuy = 100;


	it('Check openingTime and closingTime of the contract', async () => {
		const crowdsale = await RVLCrowdsale.deployed();

		const openingTime = await crowdsale.openingTime.call();
		const closingTime = await crowdsale.closingTime.call();

		assert.exists(openingTime.toNumber(), 'Incorrect openingTime value');
		assert.exists(closingTime.toNumber(), 'Incorrect closingTime value');
		assert.isBelow(openingTime.toNumber(), closingTime.toNumber(), 'Opening time must be below closing time');
	});

	it('Check initial RVL balance, make buying, and check account after', async () => {
		const coin = await RVLCoin.deployed();
		const crowdsale = await RVLCrowdsale.deployed();

		const amount_before = await coin.balanceOf.call(account);
		console.log('amount_before', amount_before);
		assert.equal(amount_before.toNumber(), 0, 'Wrong initial balance on account before buying');

		await crowdsale.sendTransaction({from: account, value: 10000});
		console.log('Transaction sended');

		const amount_after = await coin.balanceOf.call(account);
		console.log('amount_after', amount_after);
		// assert.equal(amount_before.toNumber(), 0, 'Wrong initial balance on account before buying');
	});

});


