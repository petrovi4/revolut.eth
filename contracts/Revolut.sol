pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';


contract Content is Ownable {

	enum AdminRole { None, ManageFundings, ManageUsers, ManageAdmins, God }
	struct Admin {
		AdminRole role;
	}
	mapping(address => Admin) public admins;



	enum UserState { Blocked, Deleted, Active }
	struct User {
		string displayName;
		string countryCode;
		UserState state;
	}
	mapping(address => User) public users;
	address[] public userIds;



	enum FundingState { Blocked, Deleted, InReview, Active, Completed }
	struct Funding {
		uint id;
		string name;
		string description;
		FundingState state;
		uint end;
		address beneficiary;
		string countryCode;
		string geoLocation;
	}
	mapping(uint => Funding) public fundings;
	uint[] public fundingIds;



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





	modifier onlyAdmin(AdminRole role) {
		require(
			admins[msg.sender].role == role,
			"Only admin with required role can call this."
		);
		_;

	}
	modifier onlyUser() {
		require(
			users[msg.sender].state == UserState.Active,
			"Only registered and active user can call this."
		);
		_;
	}



	event PostCreated(address author, address funding, uint admount);
	event PostReplenished(address post, address author, address funding, uint amount);



	constructor() public {
		admins[msg.sender] = Admin({
			role: AdminRole.God
		});
	}

	// function init () public {
	// 	Funding funding = Funding({

	// 	});
	// }
	



	function signUp(string _displayName, string _countryCode) public {
		User storage usr = users[msg.sender];

		// Любое, отличное от нуля состояние означает, что такой пользователь уже зарегистрирован
		require(
			usr.state != UserState.Blocked && usr.state != UserState.Deleted && usr.state != UserState.Active,
			"Already signed up"
		);

		users[msg.sender] = User({
			displayName: _displayName,
			countryCode: _countryCode,
			state: UserState.Active
		});
		userIds.push(msg.sender);
	}

	function deleteSelf() public onlyUser() {
		users[msg.sender].state = UserState.Deleted;
	}

	function blockUser(address user) public onlyAdmin(AdminRole.ManageUsers) {
		require(users[user].state == UserState.Active);
		users[user].state = UserState.Deleted;
	}



	function assignAdminRole(address newAdmin, AdminRole _role) public onlyAdmin(AdminRole.ManageAdmins) {
		Admin storage admin = admins[newAdmin];

		require(
			admin.role != _role,
			"Already signed up"
		);

		admin.role = _role;
	}



	function getMinimalEventPayable(string _countryCode) public view returns (uint sumAmount) {
		bytes32 encodedCountryCode = keccak256(abi.encodePacked(_countryCode));

		for (uint i = 0; i < postIds.length; i++) {
			User storage user = users[posts[postIds[i]].author];
			if(keccak256(abi.encodePacked(user.countryCode)) == encodedCountryCode){
				sumAmount += posts[postIds[i]].totalAmount;
			}
		}
		if(sumAmount < 100) sumAmount = 100;
	}

	function addFunding(string _name, string _description, uint _end, string _geoLocation) public payable onlyUser() {
		User storage user = users[msg.sender];
		uint minimalAmount = getMinimalEventPayable(user.countryCode);
		require(msg.value > minimalAmount, "Minitmal amount for funding required");
	}

}