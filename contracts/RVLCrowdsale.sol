pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

import 'openzeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol';

import './RVLCoin.sol';


contract RVLCrowdsale is TimedCrowdsale {

	constructor (uint256 _openingTime, uint256 _closingTime, address _wallet) 
		TimedCrowdsale(_openingTime, _closingTime) 
		public 
	{
		require(_wallet != address(0));

		rate = 1;
		wallet = _wallet;
		token = new RVLCoin();
	}

}
