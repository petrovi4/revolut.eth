pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

import 'openzeppelin-solidity/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol';

import './RVLCoin.sol';


contract RVLCrowdsale is TimedCrowdsale(now - 1 days, now + 1 days) {

	constructor (address _wallet) public {
		token = new RVLCoin();
		wallet = _wallet;
		rate = 1e5;
	}

}
