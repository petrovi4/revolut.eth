var RVLToken = artifacts.require("./RVLToken.sol");
var RVLSale = artifacts.require("./RVLSale.sol");
var Revolut = artifacts.require("./Revolut.sol");

web3.toAsciiOriginal = web3.toAscii;
web3.toAscii = function (input) { return web3.toAsciiOriginal(input).replace(/\u0000/g, '') }

contract('Revolut - Initialize, user signUp/login/delete', async (accounts) => {

	let sale;
	let revolut;

	let token_address, token;
	let balance;

	let account_user = accounts[1];
	const user_name = 'Test name';
	const user_country = 'us';
	const user_avatarIpfsId = 'no_avatar';

	const etherToSend = 1;
	const tokensToBuy = web3.toWei(etherToSend);

	it('Init - buy tokens', async () => {
		sale = await RVLSale.deployed();

		token_address = await sale.token.call()
		token = await RVLToken.at(token_address);

		await sale.sendTransaction({from: account_user, value: web3.toWei(etherToSend, 'ether')});

		balance = await token.balanceOf.call(account_user);
		assert.equal(balance.toNumber(), tokensToBuy, 'Wrong account balance after buying');
	});


	it('Can add country', async () => {
		revolut = await Revolut.deployed();

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



});


