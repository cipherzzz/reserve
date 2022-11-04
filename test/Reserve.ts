import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

describe("Reserve", function () {

  const INITIAL_SUPPLY = 1000000; // 1 million
  const MAX_LIMIT = 100; // Max Withdrawal in a single tx regardless of block height
  const REFILL_RATE = 1; // Withdrawal addend per block
  const DEPOSIT_AMT = 1000; // default deposit amount of erc20

  // Helper to instruct hardhat to mine n blocks for testing
  async function mineNBlocks(n: number) {
    for (let index = 0; index < n; index++) {
      await ethers.provider.send("evm_mine", []);
    }
  }

  async function deployFixtures() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, emptyAccount] = await ethers.getSigners();

    const DummyERC20 = await ethers.getContractFactory("DummyERC20");
    const dummyERC20 = await DummyERC20.deploy("Dummy ERC20", "DUMMY", INITIAL_SUPPLY);

    const Reserve = await ethers.getContractFactory("Reserve");
    const reserve = await Reserve.deploy(dummyERC20.address, utils.parseEther(MAX_LIMIT.toString()), utils.parseEther(REFILL_RATE.toString()));

    return { reserve, dummyERC20, owner, otherAccount, emptyAccount };
  }

  describe("Deployment", function () {

    it("DummyERC20 should have correct initial supply", async function () {
      const { dummyERC20, owner } = await loadFixture(deployFixtures);

      expect(await dummyERC20.totalSupply()).to.equal(utils.parseEther(INITIAL_SUPPLY.toString()));
      expect(await dummyERC20.balanceOf(owner.address)).to.equal(utils.parseEther(INITIAL_SUPPLY.toString()));

    });

    it("Should deploy wallet", async function () {
      const { reserve } = await loadFixture(deployFixtures);
      expect(reserve.address).to.exist;
    });

    it("Should allow user to deposit ERC20 tokens", async function () {
      const { dummyERC20, reserve, otherAccount } = await loadFixture(deployFixtures);
      await dummyERC20.approve(reserve.address, utils.parseEther(DEPOSIT_AMT.toString()));
      await reserve.deposit(otherAccount.address, utils.parseEther(DEPOSIT_AMT.toString()));

      // Check that the balances mapping is correct
      expect(await reserve.balances(otherAccount.address)).to.equal(utils.parseEther(DEPOSIT_AMT.toString()));

      // dummy check that the contract has a balance of the erc20
      expect(await dummyERC20.balanceOf(reserve.address)).to.equal(utils.parseEther(DEPOSIT_AMT.toString()));
    });

    it("Should not allow user WITHOUT balance to spend ERC20 tokens", async function () {
      const { reserve, emptyAccount } = await loadFixture(deployFixtures);

      const withdrawal = 1;
      expect(reserve.spend(emptyAccount.address, utils.parseEther(withdrawal.toString()))).to.be.revertedWith("Reserve: Withdrawal amount exceeds available balance");
    });

  });
});
