pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

import 'openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol';


contract RVLToken is CappedToken(200000 ether) {
	string public constant name    = "Revolut Token";  // The Token's name
	string public constant symbol  = "RVL";            // An identifier    
	uint8 public constant decimals = 12;               // Number of decimals of the smallest unit
}
