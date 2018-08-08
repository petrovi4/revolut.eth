var RVLCoin = artifacts.require("./RVLCoin.sol");

contract('RVLCoin - Initialize, cap and simple transfer', async (accounts) => {

	const cap = 1e10
	const toMint = 1000;
	const account = accounts[0];

	const accountFrom = accounts[0];
	const accountTo = accounts[1];

	const coinsToTransfer = 100;


	it('Check cap of the contract', async () => {
		const instance = await RVLCoin.deployed();

		const currentCap = await instance.cap.call();
		assert.equal(currentCap.toNumber(), cap, 'Incorrect cap amount');
	});


	it('Check is mint worked well', async () => {
		const instance = await RVLCoin.deployed();


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


		const amountFrom_before = await instance.balanceOf.call(accountFrom);
		assert.equal(amountFrom_before.toNumber(), toMint, 'Wrong initial balance on account [from] before transfer');

		const amountTo_before = await instance.balanceOf.call(accountTo);
		assert.equal(amountTo_before.toNumber(), 0, 'Wrong initial balance on account [to] before transfer');


		await instance.transfer(accountTo, coinsToTransfer, {from: accountFrom});


		const amountFrom_after = await instance.balanceOf.call(accountFrom);
		assert.equal(amountFrom_after.toNumber(), toMint - coinsToTransfer, 'Wrong final balance on account [from] after transfer');

		const amountTo_after = await instance.balanceOf.call(accountTo);
		assert.equal(amountTo_after.toNumber(), 0 + coinsToTransfer, 'Wrong final balance on account [to] after transfer');
	});

});


contract('RVLCoin - Transfer through allowance mechanism', async (accounts) => {

	const toMint = 1000;
	const account = accounts[0];

	const accountFrom = accounts[0];
	const accountApproved = accounts[1];
	const accountTo = accounts[2];

	const coinsToApprove = 100;
	const diffToCheckInc = 1;
	const diffToCheckDec = 3;
	const coinsToTransfer = 20;


	it('Initialize', async () => {
		const instance = await RVLCoin.deployed();
		await instance.mint(account, toMint, {from: account});
	});


	it('Check is user can transfer coins through allowance mechanism', async () => {
		const instance = await RVLCoin.deployed();


		const amountFrom_before = await instance.balanceOf.call(accountFrom);
		assert.equal(amountFrom_before.toNumber(), toMint, 'Wrong initial balance on account [from] before transfer');

		const amountTo_before = await instance.balanceOf.call(accountApproved);
		assert.equal(amountTo_before.toNumber(), 0, 'Wrong initial balance on account [to] before transfer');



		await instance.approve(accountApproved, coinsToApprove, {from: accountFrom});

		const nowApproved = await instance.allowance.call(accountFrom, accountApproved);
		assert.equal(nowApproved.toNumber(), coinsToApprove, 'Wrong allowance amount');



		await instance.increaseApproval(accountApproved, diffToCheckInc, {from: accountFrom});

		const incApproved = await instance.allowance.call(accountFrom, accountApproved);
		assert.equal(incApproved.toNumber(), coinsToApprove + diffToCheckInc, 'Wrong allowance amount after increase');



		await instance.decreaseApproval(accountApproved, diffToCheckDec, {from: accountFrom});

		const decApproved = await instance.allowance.call(accountFrom, accountApproved);
		assert.equal(decApproved.toNumber(), coinsToApprove + diffToCheckInc - diffToCheckDec, 'Wrong allowance amount after decrease');



		await instance.transferFrom(accountFrom, accountTo, coinsToTransfer, {from: accountApproved});

		const amountFrom_after = await instance.balanceOf.call(accountFrom);
		assert.equal(amountFrom_after.toNumber(), toMint - coinsToTransfer, 'Wrong final balance on account [from] after transfer');

		const amountTo_after = await instance.balanceOf.call(accountTo);
		assert.equal(amountTo_after.toNumber(), coinsToTransfer, 'Wrong final balance on account [to] after transfer');

		const approvedAmount_after = await instance.allowance.call(accountFrom, accountApproved);
		assert.equal(approvedAmount_after.toNumber(), coinsToApprove + diffToCheckInc - diffToCheckDec - coinsToTransfer, 'Wrong final balance on account [to] after transfer');


	});
});
