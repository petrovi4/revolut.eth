var RVLCoin = artifacts.require("./RVLCoin.sol");

contract('RVLCoin', async (accounts) => {


	it('Check cap of the contract', async () => {
		const instance = await RVLCoin.deployed();

		const cap = await instance.cap.call();
		assert.equal(cap.toNumber(), 1e10, 'Incorrect cap amount');
	});


	it('Check is mint worked well', async () => {
		const instance = await RVLCoin.deployed();

		const toMint = 1e3;
		const account = accounts[0];

		const balanceBefore = await instance.balanceOf.call(account);
		assert.equal(balanceBefore.toNumber(), 0, 'Wrong initial balance');

		await instance.mint(account, toMint, {from: account});

		const balanceAfter = await instance.balanceOf.call(account);
		assert.equal(balanceAfter.toNumber(), toMint, 'Wrong minted amount');

		const totalSupply = await instance.totalSupply.call();
		assert.equal(totalSupply.toNumber(), toMint, 'Wrong totalSupply amount');
	});


	it('Check is user can transfer coins', async () => {
		const instance = await RVLCoin.deployed();

		const toMint = 1e3;
		const coins = 1e2;

		const accountFrom = accounts[0];
		const accountTo = accounts[1];


		const amountFrom_before = await instance.balanceOf.call(accountFrom);
		assert.equal(amountFrom_before.toNumber(), toMint, 'Wrong initial balance on account [from] before transfer');

		const amountTo_before = await instance.balanceOf.call(accountTo);
		assert.equal(amountTo_before.toNumber(), 0, 'Wrong initial balance on account [to] before transfer');


		await instance.transfer(accountTo, coins, {from: accountFrom});


		const amountFrom_after = await instance.balanceOf.call(accountFrom);
		assert.equal(amountFrom_after.toNumber(), toMint - coins, 'Wrong initial balance on account [from] after transfer');

		const amountTo_after = await instance.balanceOf.call(accountTo);
		assert.equal(amountTo_after.toNumber(), 0 + coins, 'Wrong initial balance on account [to] after transfer');
	});



});
