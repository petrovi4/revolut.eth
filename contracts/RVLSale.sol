pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

import 'openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import 'openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';

import './RVLToken.sol';


contract RVLSale is Ownable, Crowdsale, MintedCrowdsale {

	/// Chart of stage transition 
	///
	/// deploy   initialize   startCrowdsaleTime                   endCrowdsaleTime       startSaleTime   finalize
	///              |                 | <-earlyStageLasts-> |             |                   |              |
	///  O-----------O-----------------O---------------------O-------------O-------------------O--------------0-------------->
	///    Created      Initialized             Early             Normal           Paused           inSale        Finalized
	// enum Stage {
	// 	NotCreated,
	// 	Created,
	// 	Initialized,
	// 	Early,
	// 	Normal,
	// 	Closed,
	// 	Finalized
	// }

	constructor (address _wallet) Crowdsale(1, _wallet, new RVLToken()) public {
	}
}
