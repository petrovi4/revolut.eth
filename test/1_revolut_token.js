var RVLToken = artifacts.require("./RVLToken.sol");

contract('RVLToken - Initialize, cap and simple transfer', async (accounts) => {

	const cap = 1e10
	const toMint = 1000;
	const account = accounts[0];

	const accountFrom = accounts[0];
	const accountTo = accounts[1];

	const tokensToTransfer = 100;


	it('Check cap of the contract', async () => {
		const token = await RVLToken.deployed();

		const currentCap = await token.cap.call();
		assert.equal(currentCap.toNumber(), cap, 'Incorrect cap amount');
	});


	it('Check is mint worked well', async () => {
		const token = await RVLToken.deployed();

		const balanceBefore = await token.balanceOf.call(account);
		assert.equal(balanceBefore.toNumber(), 0, 'Wrong initial balance');

		await token.mint(account, toMint, {from: account});

		const balanceAfter = await token.balanceOf.call(account);
		assert.equal(balanceAfter.toNumber(), toMint, 'Wrong minted amount');

		const totalSupply = await token.totalSupply.call();
		assert.equal(totalSupply.toNumber(), toMint, 'Wrong totalSupply amount');
	});


	it('Check is user can transfer tokens', async () => {
		const token = await RVLToken.deployed();


		const amountFrom_before = await token.balanceOf.call(accountFrom);
		assert.equal(amountFrom_before.toNumber(), toMint, 'Wrong initial balance on account [from] before transfer');

		const amountTo_before = await token.balanceOf.call(accountTo);
		assert.equal(amountTo_before.toNumber(), 0, 'Wrong initial balance on account [to] before transfer');


		await token.transfer(accountTo, tokensToTransfer, {from: accountFrom});


		const amountFrom_after = await token.balanceOf.call(accountFrom);
		assert.equal(amountFrom_after.toNumber(), toMint - tokensToTransfer, 'Wrong final balance on account [from] after transfer');

		const amountTo_after = await token.balanceOf.call(accountTo);
		assert.equal(amountTo_after.toNumber(), 0 + tokensToTransfer, 'Wrong final balance on account [to] after transfer');
	});

});


contract('RVLToken - Transfer through allowance mechanism', async (accounts) => {

	const toMint = 1000;
	const account = accounts[0];

	const accountFrom = accounts[0];
	const accountApproved = accounts[1];
	const accountTo = accounts[2];

	const tokensToApprove = 100;
	const diffToCheckInc = 1;
	const diffToCheckDec = 3;
	const tokensToTransfer = 20;


	it('Initialize', async () => {
		const token = await RVLToken.deployed();
		await token.mint(account, toMint, {from: account});
	});


	it('Check is user can transfer tokens through allowance mechanism', async () => {
		const token = await RVLToken.deployed();


		const amountFrom_before = await token.balanceOf.call(accountFrom);
		assert.equal(amountFrom_before.toNumber(), toMint, 'Wrong initial balance on account [from] before transfer');

		const amountTo_before = await token.balanceOf.call(accountApproved);
		assert.equal(amountTo_before.toNumber(), 0, 'Wrong initial balance on account [to] before transfer');



		await token.approve(accountApproved, tokensToApprove, {from: accountFrom});

		const nowApproved = await token.allowance.call(accountFrom, accountApproved);
		assert.equal(nowApproved.toNumber(), tokensToApprove, 'Wrong allowance amount');



		await token.increaseApproval(accountApproved, diffToCheckInc, {from: accountFrom});

		const incApproved = await token.allowance.call(accountFrom, accountApproved);
		assert.equal(incApproved.toNumber(), tokensToApprove + diffToCheckInc, 'Wrong allowance amount after increase');



		await token.decreaseApproval(accountApproved, diffToCheckDec, {from: accountFrom});

		const decApproved = await token.allowance.call(accountFrom, accountApproved);
		assert.equal(decApproved.toNumber(), tokensToApprove + diffToCheckInc - diffToCheckDec, 'Wrong allowance amount after decrease');



		await token.transferFrom(accountFrom, accountTo, tokensToTransfer, {from: accountApproved});

		const amountFrom_after = await token.balanceOf.call(accountFrom);
		assert.equal(amountFrom_after.toNumber(), toMint - tokensToTransfer, 'Wrong final balance on account [from] after transfer');

		const amountTo_after = await token.balanceOf.call(accountTo);
		assert.equal(amountTo_after.toNumber(), tokensToTransfer, 'Wrong final balance on account [to] after transfer');

		const approvedAmount_after = await token.allowance.call(accountFrom, accountApproved);
		assert.equal(approvedAmount_after.toNumber(), tokensToApprove + diffToCheckInc - diffToCheckDec - tokensToTransfer, 'Wrong final balance on account [to] after transfer');
	});
});
