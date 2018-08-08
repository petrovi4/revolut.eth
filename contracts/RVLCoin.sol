pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

import 'openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';


contract RVLCoin is CappedToken(1e10), DetailedERC20('Revolut Coin', 'RVL', 0) {
}
