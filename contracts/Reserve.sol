// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Reserve is ReentrancyGuard
 {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public token;
    uint256 public refillRate;
    uint256 public maxLimit;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public withdrawals;

    // @dev - Supporting a single ERC20 token for now
    constructor(address _token, uint256 _maxLimit, uint256 _refillRate) {
        token = _token;
        refillRate = _refillRate;
        maxLimit = _maxLimit;
    }

    function deposit(address _account, uint256 _amount) external {
        IERC20 erc20 = IERC20(token);   
        erc20.transferFrom(msg.sender, address(this), _amount);
        balances[_account] += _amount;
    }

    function spend(address _recipient, uint256 _amount) external nonReentrant {

        require(_amount <= maxLimit, "Withdrawal amount exceeds max withdrawal limit");

        uint256 currentBlock = block.number;
        uint256 lastWithdrawalBlock = withdrawals[msg.sender];

        // console.log("current block", block.number);
        // console.log("lastWithdrawalBlock block", lastWithdrawalBlock);

        uint256 withdrawalMultiplier = 1;
        
        if(lastWithdrawalBlock > 0 && currentBlock > lastWithdrawalBlock) {
            withdrawalMultiplier = currentBlock.sub(lastWithdrawalBlock);
        } 

        uint256 blockWithdrawal = refillRate.mul(withdrawalMultiplier);

        require(_amount <= blockWithdrawal, "Withdrawal amount exceeds max withdrawal per block");

        IERC20 erc20 = IERC20(token);
        erc20.safeTransfer(_recipient, _amount);
        balances[msg.sender] -= _amount;
        withdrawals[msg.sender] = currentBlock;
    }
}
