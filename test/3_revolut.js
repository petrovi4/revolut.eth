var RVLToken = artifacts.require('./RVLToken.sol');
var RVLSale = artifacts.require('./RVLSale.sol');
var Revolut = artifacts.require('./Revolut.sol');

web3.toAsciiOriginal = web3.toAscii;
web3.toAscii = function (input) { return web3.toAsciiOriginal(input).replace(/\u0000/g, '') }


const duration = {
	seconds: function (val) { return val},
	minutes: function (val) { return val * this.seconds(60) },
	hours: function (val) { return val * this.minutes(60) },
	days: function (val) { return val * this.hours(24) },
	weeks: function (val) { return val * this.days(7) },
	years: function (val) { return val * this.days(365)}
}


contract('Revolut - Initialize, user signUp/login/delete, country management, working with fundings', async (accounts) => {

	let sale;
	let revolut;

	let token_address;
	let token;
	let balance;

	let account_user = accounts[1];
	const user_name = 'Test name';
	const user_country = 'us';
	const user_avatarIpfsId = 'no_avatar';

	let funding_creation_price;

	const funding_name = 'Test funding';
	const funding_description = 'Funding for test';
	const funding_imageIpfsId = 'no_image';
	const funding_startDate = web3.eth.getBlock('latest').timestamp - duration.minutes(5);
	const funding_endDate = funding_startDate + duration.minutes(10);
	const funding_countryCode = user_country;
	const funding_geoLat = 1;
	const funding_geoLon = 2;

	const etherToSend = 1;
	const tokensToBuy = web3.toWei(etherToSend);

	it('Init - buy tokens', async () => {
		sale = await RVLSale.deployed();
		token_address = await sale.token.call();
		token = RVLToken.at(token_address);
		revolut = await Revolut.deployed();

		await sale.sendTransaction({from: account_user, value: web3.toWei(etherToSend, 'ether')});

		balance = await token.balanceOf.call(account_user);
		assert.equal(balance.toNumber(), tokensToBuy, 'Wrong account balance after buying');
	});


	it('Add country', async () => {
		let countries = await revolut.getAllCountries.call();
		assert.equal(countries.length, 0, 'New contract havn\'t countries');

		await revolut.addCountry(web3.fromAscii(user_country));

		countries = await revolut.getAllCountries.call();
		assert.equal(countries.length, 1, 'Country not added');
		assert.equal(countries[0], web3.fromAscii(user_country), 'Wrong country');
	});


	it('Check is signUp working well', async () => {
		revolut = await Revolut.deployed();

		let userIds = await revolut.getAllUserIds.call();
		assert.equal(userIds.length, 0, 'New contract can\'t have users');

		await revolut.signUp(web3.fromAscii(user_name), web3.fromAscii(user_country), web3.fromAscii(user_avatarIpfsId), {from: account_user});

		userIds = await revolut.getAllUserIds.call();
		assert.equal(userIds.length, 1, 'User not registered');
		assert.equal(userIds[0], account_user, 'Wrong user id');

		const user_arr = await revolut.users(account_user);
		assert.exists(user_arr, 'No user by id');
		
		const user = {
			displayName: web3.toAscii(user_arr[0]),
			countryCode: web3.toAscii(user_arr[1]),
			avatarIpfsId: web3.toAscii(user_arr[2]),
			state: user_arr[3].toNumber(),
		};
		assert.equal(user.displayName, user_name, 'Wrong user.displayName');
		assert.equal(user.countryCode, user_country, 'Wrong user.countryCode');
		assert.equal(user.avatarIpfsId, user_avatarIpfsId, 'Wrong user.avatarIpfsId');
	});


	it('Calc funding price', async () => {
		funding_creation_price = await revolut.getMinimalFundingPayable.call(web3.fromAscii(funding_countryCode));
		assert.isAbove(funding_creation_price.toNumber(), 0, 'funding_creation_price must be above 0 (zero)');
	});


	it('Approve to spend funding price', async () => {
		const approveTran = await token.approve(revolut.address, funding_creation_price, {from: account_user});

		const allowed = await token.allowance.call(account_user, revolut.address);
		assert.equal(allowed.toNumber(), funding_creation_price, 'Allowance not stored in token contract');

		const balance = await token.balanceOf.call(account_user);
		assert.isAbove(balance.toNumber(), 0, 'Account balance must be above 0 (zero)');
	});


	it('Add Funding and control RVL token costs', async () => {
		let fundingIds = await revolut.getAllFundingIds.call();
		assert.equal(fundingIds.length, 0, 'New contract can\'t have fundings');

		const balance_before_adding_funding = await token.balanceOf.call(account_user);
		assert.isAbove(balance_before_adding_funding.toNumber(), 0, 'Account balance must be above 0 (zero)');

		const tran = await revolut.addFunding(
			web3.fromAscii(funding_name), 
			web3.fromAscii(funding_description), 
			web3.fromAscii(funding_imageIpfsId), 
			funding_startDate,
			funding_endDate,
			web3.fromAscii(funding_countryCode),
			funding_geoLat,
			funding_geoLon,
			{from: account_user}
		);

		fundingIds = await revolut.getAllFundingIds.call();
		assert.equal(fundingIds.length, 1, 'Funding not registered');

		const funding_arr = await revolut.fundings.call(fundingIds[0]);
		const funding = {
			id: web3.toAscii(funding_arr[0]),
			name: web3.toAscii(funding_arr[1]),
			description: web3.toAscii(funding_arr[2]),
			imageIpfsId: web3.toAscii(funding_arr[3]),
			state: funding_arr[4].toNumber(),
			startDate: funding_arr[5].toNumber(),
			endDate: funding_arr[6].toNumber(),
			beneficiary: funding_arr[7],
			countryCode: web3.toAscii(funding_arr[8]),
			geoLat: funding_arr[9].toNumber(),
			geoLon: funding_arr[10].toNumber(),
		}

		assert.equal(funding.name, funding_name, 'Wrong funding.name');
		assert.equal(funding.description, funding_description, 'Wrong funding.description');
		assert.equal(funding.imageIpfsId, funding_imageIpfsId, 'Wrong funding.imageIpfsId');
		assert.equal(funding.state, 3, 'Wrong funding.state');
		assert.equal(funding.startDate, funding_startDate, 'Wrong funding.startDate');
		assert.equal(funding.endDate, funding_endDate, 'Wrong funding.endDate');
		assert.equal(funding.beneficiary, account_user, 'Wrong funding.beneficiary');
		assert.equal(funding.countryCode, funding_countryCode, 'Wrong funding.countryCode');
		assert.equal(funding.geoLat, funding_geoLat, 'Wrong funding.geoLat');
		assert.equal(funding.geoLon, funding_geoLon, 'Wrong funding.geoLon');

		const balance_after_adding_funding = await token.balanceOf.call(account_user);
		assert.isBelow(balance_after_adding_funding.toNumber(), balance_before_adding_funding.toNumber(), 'Account balance after adding funding must be below account balance before adding funding');
		assert.equal(balance_after_adding_funding.toNumber() + parseInt(funding_creation_price), balance_before_adding_funding.toNumber(), 'Account balance after adding funding must be below account balance before adding funding by funding creation price');
	});


});


