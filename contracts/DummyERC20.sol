// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Use Preset for convenience
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract DummyERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply * 10**uint256(decimals()));
    }
}
