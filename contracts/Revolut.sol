pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import './RVLToken.sol';


contract Revolut is Ownable() {
	using SafeERC20 for RVLToken;

	RVLToken public token;

	constructor (address _tokenAddress) public {
		token = RVLToken(_tokenAddress);
	}


	// enum AdminRole { None, ManageFundings, ManageUsers, ManageAdmins, God }
	// struct Admin {
	// 	AdminRole role;
	// }
	// mapping(address => Admin) public admins;


	// -----------------------------------------------------------------
	// -------------------------- USERS --------------------------------
	// -----------------------------------------------------------------

	enum UserState { Unknown, Blocked, Deleted, Active }
	struct User {
		bytes32 displayName;
		bytes2 countryCode;
		bytes32 avatarIpfsId;
		UserState state;
	}
	mapping(address => User) public users;

	address[] public userIds;
	function getAllUserIds () public view returns(address[]) {
		return userIds;
	}

	modifier onlyUser() {
		require(
			users[msg.sender].state == UserState.Active,
			"Only registered and active user can call this."
		);
		_;
	}

	function signUp(bytes32 _displayName, bytes2 _countryCode, bytes32 _avatarIpfsId) public {
		User storage usr = users[msg.sender];

		require( usr.state != UserState.Active, "Already signed up" );
		require( usr.state != UserState.Blocked, "User blocked" );

		if(usr.state == UserState.Deleted) {
			usr.displayName = _displayName;
			usr.countryCode = _countryCode;
			usr.avatarIpfsId = _avatarIpfsId;
			usr.state = UserState.Active;
		}
		else {
			users[msg.sender] = User({
				displayName: _displayName,
				countryCode: _countryCode,
				avatarIpfsId: _avatarIpfsId,
				state: UserState.Active
			});
			userIds.push(msg.sender);
		}
	}

	function deleteSelf() public onlyUser() {
		users[msg.sender].state = UserState.Deleted;
	}

	function blockUser(address user) public onlyOwner() {
		require(users[user].state == UserState.Active || users[user].state == UserState.Deleted);
		users[user].state = UserState.Deleted;
	}


	// -----------------------------------------------------------------
	// ------------------------ COUNTRIES ------------------------------
	// -----------------------------------------------------------------

	mapping(bytes2 => bool) public countriesEnabled;

	bytes2[] public countries;
	function getAllCountries () public view returns(bytes2[]) {
		return countries;
	}

	function addCountry (bytes2 countryCode) public onlyOwner() returns(uint256) {
		require (countriesEnabled[countryCode] == false);

		countriesEnabled[countryCode] = true;
		countries.push(countryCode);
	}


	// -----------------------------------------------------------------
	// ------------------------ FUNDINGS -------------------------------
	// -----------------------------------------------------------------

	enum FundingState { Unknown, Blocked, Deleted, InReview, Active, Finished }
	struct Funding {
		bytes32 id;
		bytes32 name;
		bytes description;
		bytes32 imageIpfsId;
		FundingState state;
		uint startDate;
		uint endDate;
		address beneficiary;
		bytes2 countryCode;
		int24 geoLat;
		int24 geoLon;
	}
	mapping(bytes32 => Funding) public fundings;

	bytes32[] public fundingIds;
	function getAllFundingIds () public view returns(bytes32[]) {
		return fundingIds;
	}

	function getMinimalFundingPayable(bytes2 countryCode) public view returns (uint sumAmount) {
		for (uint i = 0; i < postIds.length; i++) {
			User storage user = users[posts[postIds[i]].author];
			if(user.countryCode == countryCode){
				sumAmount += posts[postIds[i]].totalAmount;
			}
		}
		// TODO: Calculate 1% from total amount in country
		if(sumAmount < 100) sumAmount = 100; // TODO: Define minimal amount
	}

	// event LogAddress(address adrs);
	// event LogUInt(uint256 unt);

	function addFunding(
		bytes32 _name,
		bytes _description,
		bytes32 _imageIpfsId,
		uint _startDate,
		uint _endDate,
		bytes2 _countryCode,
		int24 _geoLat,
		int24 _geoLon
	) public onlyUser() {
		User storage user = users[msg.sender];
		uint priceForFunding = getMinimalFundingPayable(user.countryCode);

		bytes32 id = keccak256(abi.encodePacked(_name));
		Funding storage fnd = fundings[id];

		require (fnd.state != FundingState.Active, 'Funding with same name already exists');
		require (fnd.state != FundingState.InReview, 'Funding with same name already in review');
		require (fnd.state != FundingState.Finished, 'Funding with same name already finished');
		require (fnd.state != FundingState.Blocked, 'Funding with same name already blocked');

		if(fnd.state == FundingState.Deleted) {
			fnd.name = _name;
			fnd.description = _description;
			fnd.imageIpfsId = _imageIpfsId;
			fnd.startDate = _startDate;
			fnd.endDate = _endDate;
			fnd.countryCode = _countryCode;
			fnd.geoLat = _geoLat;
			fnd.geoLon = _geoLon;
			fnd.state = FundingState.InReview;
		}
		else {
			fundings[id] = Funding({
				id: id,
				name: _name,
				description: _description,
				imageIpfsId: _imageIpfsId,
				state: FundingState.InReview,
				startDate: _startDate,
				endDate: _endDate,
				beneficiary: msg.sender,
				countryCode: _countryCode,
				geoLat: _geoLat,
				geoLon: _geoLon
			});
			fundingIds.push(id);
		}

		// uint256 balance = token.balanceOf(msg.sender);
		// uint256 allowed = token.allowance(msg.sender, address(this));

		// emit LogAddress(token);
		// emit LogAddress(msg.sender);
		// emit LogUInt(balance);
		// emit LogUInt(allowed);
		
		require(token.transferFrom(msg.sender, address(this), priceForFunding));
	}



	struct Post {
		uint id;
		uint created;

		address author;
		uint initialAmount;
		uint totalAmount;

		string imageId;
		string title;
	}
	mapping(uint => Post) public posts;
	uint[] public postIds;

	struct Supporter {
		address user;
		uint amount;
		string comment;
	}
	mapping(uint => Supporter[]) public supporters; // by Post.id





	// modifier onlyAdmin(AdminRole role) {
	// 	require(
	// 		admins[msg.sender].role == role,
	// 		"Only admin with required role can call this."
	// 	);
	// 	_;
	// }



	event PostCreated(address author, address funding, uint admount);
	event PostReplenished(address post, address author, address funding, uint amount);
	



}