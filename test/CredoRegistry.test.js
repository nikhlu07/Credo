const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredoRegistry", function () {
  let credoRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy a fresh instance of the contract before each test
    const CredoRegistry = await ethers.getContractFactory("CredoRegistry");
    credoRegistry = await CredoRegistry.deploy();
    await credoRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await credoRegistry.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero scores for all addresses", async function () {
      expect(await credoRegistry.getScore(addr1.address)).to.equal(0);
      expect(await credoRegistry.getScore(addr2.address)).to.equal(0);
    });
  });

  describe("Score Updates", function () {
    it("Should update score correctly and emit ScoreUpdated event", async function () {
      const testScore = 100;
      
      // Test that the transaction emits the correct event
      await expect(credoRegistry.updateScore(addr1.address, testScore))
        .to.emit(credoRegistry, "ScoreUpdated")
        .withArgs(addr1.address, testScore);

      // Verify the score was updated correctly
      expect(await credoRegistry.getScore(addr1.address)).to.equal(testScore);
    });

    it("Should allow owner to update multiple users' scores", async function () {
      const score1 = 250;
      const score2 = 750;

      await credoRegistry.updateScore(addr1.address, score1);
      await credoRegistry.updateScore(addr2.address, score2);

      expect(await credoRegistry.getScore(addr1.address)).to.equal(score1);
      expect(await credoRegistry.getScore(addr2.address)).to.equal(score2);
    });

    it("Should allow updating the same user's score multiple times", async function () {
      const initialScore = 100;
      const updatedScore = 200;

      await credoRegistry.updateScore(addr1.address, initialScore);
      expect(await credoRegistry.getScore(addr1.address)).to.equal(initialScore);

      await credoRegistry.updateScore(addr1.address, updatedScore);
      expect(await credoRegistry.getScore(addr1.address)).to.equal(updatedScore);
    });
  });

  describe("Access Control", function () {
    it("Should revert when non-owner tries to update score", async function () {
      const testScore = 100;

      // Try to update score from addr1 (not owner)
      await expect(
        credoRegistry.connect(addr1).updateScore(addr2.address, testScore)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should revert when non-owner tries to update their own score", async function () {
      const testScore = 100;

      // Try to update own score from addr1 (not owner)
      await expect(
        credoRegistry.connect(addr1).updateScore(addr1.address, testScore)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Score Retrieval", function () {
    it("Should return correct score after update", async function () {
      const testScore = 500;
      
      await credoRegistry.updateScore(addr1.address, testScore);
      
      expect(await credoRegistry.getScore(addr1.address)).to.equal(testScore);
    });

    it("Should return zero for addresses that haven't been scored", async function () {
      expect(await credoRegistry.getScore(addr1.address)).to.equal(0);
      expect(await credoRegistry.getScore(addr2.address)).to.equal(0);
    });

    it("Should handle maximum uint256 score values", async function () {
      const maxScore = ethers.MaxUint256;
      
      await credoRegistry.updateScore(addr1.address, maxScore);
      
      expect(await credoRegistry.getScore(addr1.address)).to.equal(maxScore);
    });
  });
});