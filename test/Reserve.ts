import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { utils } from "ethers";

describe("Reserve", function () {

  const INITIAL_SUPPLY = 1000000; // 1 million
  const DEPOSIT_AMT = 100;
  const MAX_WITHDRAWAL_BLOCK = 1;

  // Helper to instruct hardhat to mine n blocks for testing
  async function mineNBlocks(n: number) {
    for (let index = 0; index < n; index++) {
      await ethers.provider.send("evm_mine", []);
    }
  }

  async function deployFixtures() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const DummyERC20 = await ethers.getContractFactory("DummyERC20");
    const dummyERC20 = await DummyERC20.deploy("Dummy ERC20", "DUMMY", INITIAL_SUPPLY);

    return { dummyERC20, owner, otherAccount };
  }

  describe("Deployment", function () {

    it("DummyERC20 should have correct initial supply", async function () {
      const { dummyERC20, owner } = await loadFixture(deployFixtures);

      expect(await dummyERC20.totalSupply()).to.equal(utils.parseEther(INITIAL_SUPPLY.toString()));
      expect(await dummyERC20.balanceOf(owner.address)).to.equal(utils.parseEther(INITIAL_SUPPLY.toString()));

    });
  });
});
