// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";


contract Reserve
 {

    address public token;
    uint256 public refillRate;
    uint256 public maxLimit;

    // @dev - Supporting a single ERC20 token for now
    constructor(address _token, uint256 _maxLimit, uint256 _refillRate) {
        token = _token;
        refillRate = _refillRate;
        maxLimit = _maxLimit;
    }
}
