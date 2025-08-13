const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CredoScoreRegistry", function () {
  let credoScoreRegistry;
  let owner;
  let oracle1;
  let oracle2;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, oracle1, oracle2, user1, user2] = await ethers.getSigners();

    const CredoScoreRegistry = await ethers.getContractFactory("CredoScoreRegistry");
    credoScoreRegistry = await CredoScoreRegistry.deploy();
    await credoScoreRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await credoScoreRegistry.owner()).to.equal(owner.address);
    });

    it("Should authorize owner as oracle by default", async function () {
      expect(await credoScoreRegistry.authorizedOracles(owner.address)).to.be.true;
    });

    it("Should initialize with zero scores for all addresses", async function () {
      const [score, lastUpdated, version, isActive] = await credoScoreRegistry.getScoreData(user1.address);
      expect(score).to.equal(0);
      expect(lastUpdated).to.equal(0);
      expect(version).to.equal(0);
      expect(isActive).to.be.false;
    });
  });

  describe("Oracle Authorization", function () {
    it("Should allow owner to authorize oracles", async function () {
      await expect(credoScoreRegistry.setOracleAuthorization(oracle1.address, true))
        .to.emit(credoScoreRegistry, "OracleAuthorized")
        .withArgs(oracle1.address, true);

      expect(await credoScoreRegistry.authorizedOracles(oracle1.address)).to.be.true;
    });

    it("Should allow owner to deauthorize oracles", async function () {
      await credoScoreRegistry.setOracleAuthorization(oracle1.address, true);
      
      await expect(credoScoreRegistry.setOracleAuthorization(oracle1.address, false))
        .to.emit(credoScoreRegistry, "OracleAuthorized")
        .withArgs(oracle1.address, false);

      expect(await credoScoreRegistry.authorizedOracles(oracle1.address)).to.be.false;
    });

    it("Should revert when non-owner tries to authorize oracle", async function () {
      await expect(
        credoScoreRegistry.connect(oracle1).setOracleAuthorization(oracle2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Score Updates", function () {
    beforeEach(async function () {
      // Authorize oracle1
      await credoScoreRegistry.setOracleAuthorization(oracle1.address, true);
    });

    it("Should update score correctly and emit ScoreUpdated event", async function () {
      const testScore = 750;
      const version = 2;
      
      await expect(credoScoreRegistry.connect(oracle1).updateScore(user1.address, testScore, version))
        .to.emit(credoScoreRegistry, "ScoreUpdated")
        .withArgs(user1.address, testScore, version, await time.latest() + 1, oracle1.address);

      const [score, lastUpdated, scoreVersion, isActive] = await credoScoreRegistry.getScoreData(user1.address);
      expect(score).to.equal(testScore);
      expect(scoreVersion).to.equal(version);
      expect(isActive).to.be.true;
      expect(lastUpdated).to.be.greaterThan(0);
    });

    it("Should allow multiple score updates for same user", async function () {
      await credoScoreRegistry.connect(oracle1).updateScore(user1.address, 500, 1);
      await credoScoreRegistry.connect(oracle1).updateScore(user1.address, 800, 2);

      const [score, , version] = await credoScoreRegistry.getScoreData(user1.address);
      expect(score).to.equal(800);
      expect(version).to.equal(2);
    });

    it("Should revert when unauthorized address tries to update score", async function () {
      await expect(
        credoScoreRegistry.connect(oracle2).updateScore(user1.address, 500, 1)
      ).to.be.revertedWith("Not authorized oracle");
    });

    it("Should revert when score exceeds maximum", async function () {
      await expect(
        credoScoreRegistry.connect(oracle1).updateScore(user1.address, 1001, 1)
      ).to.be.revertedWith("Score must be <= 1000");
    });

    it("Should revert when user address is zero", async function () {
      await expect(
        credoScoreRegistry.connect(oracle1).updateScore(ethers.ZeroAddress, 500, 1)
      ).to.be.revertedWith("Invalid user address");
    });
  });

  describe("Batch Updates", function () {
    beforeEach(async function () {
      await credoScoreRegistry.setOracleAuthorization(oracle1.address, true);
    });

    it("Should batch update scores correctly", async function () {
      const users = [user1.address, user2.address];
      const scores = [600, 750];
      const version = 2;

      await credoScoreRegistry.connect(oracle1).batchUpdateScores(users, scores, version);

      const [score1] = await credoScoreRegistry.getScoreData(user1.address);
      const [score2] = await credoScoreRegistry.getScoreData(user2.address);
      
      expect(score1).to.equal(600);
      expect(score2).to.equal(750);
    });

    it("Should revert when arrays have different lengths", async function () {
      const users = [user1.address, user2.address];
      const scores = [600]; // Different length

      await expect(
        credoScoreRegistry.connect(oracle1).batchUpdateScores(users, scores, 1)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("Should revert when batch size is too large", async function () {
      const users = new Array(101).fill(user1.address);
      const scores = new Array(101).fill(500);

      await expect(
        credoScoreRegistry.connect(oracle1).batchUpdateScores(users, scores, 1)
      ).to.be.revertedWith("Batch size too large");
    });
  });

  describe("Score Retrieval", function () {
    beforeEach(async function () {
      await credoScoreRegistry.setOracleAuthorization(oracle1.address, true);
      await credoScoreRegistry.connect(oracle1).updateScore(user1.address, 750, 2);
    });

    it("Should return correct score data", async function () {
      const [score, lastUpdated, version, isActive] = await credoScoreRegistry.getScoreData(user1.address);
      
      expect(score).to.equal(750);
      expect(version).to.equal(2);
      expect(isActive).to.be.true;
      expect(lastUpdated).to.be.greaterThan(0);
    });

    it("Should return score via getScore function", async function () {
      expect(await credoScoreRegistry.getScore(user1.address)).to.equal(750);
    });

    it("Should return zero for inactive scores", async function () {
      await credoScoreRegistry.connect(oracle1).deactivateScore(user1.address);
      expect(await credoScoreRegistry.getScore(user1.address)).to.equal(0);
    });
  });

  describe("Score Deactivation", function () {
    beforeEach(async function () {
      await credoScoreRegistry.setOracleAuthorization(oracle1.address, true);
      await credoScoreRegistry.connect(oracle1).updateScore(user1.address, 750, 2);
    });

    it("Should deactivate score correctly", async function () {
      await expect(credoScoreRegistry.connect(oracle1).deactivateScore(user1.address))
        .to.emit(credoScoreRegistry, "ScoreDeactivated")
        .withArgs(user1.address);

      const [, , , isActive] = await credoScoreRegistry.getScoreData(user1.address);
      expect(isActive).to.be.false;
    });

    it("Should revert when trying to deactivate already inactive score", async function () {
      await credoScoreRegistry.connect(oracle1).deactivateScore(user1.address);
      
      await expect(
        credoScoreRegistry.connect(oracle1).deactivateScore(user1.address)
      ).to.be.revertedWith("Score already inactive");
    });
  });

  describe("Utility Functions", function () {
    beforeEach(async function () {
      await credoScoreRegistry.setOracleAuthorization(oracle1.address, true);
    });

    it("Should correctly identify stale scores", async function () {
      await credoScoreRegistry.connect(oracle1).updateScore(user1.address, 750, 2);
      
      // Score should not be stale immediately
      expect(await credoScoreRegistry.isScoreStale(user1.address, 3600)).to.be.false;
      
      // Advance time and check again
      await time.increase(3601);
      expect(await credoScoreRegistry.isScoreStale(user1.address, 3600)).to.be.true;
    });

    it("Should count active scores correctly", async function () {
      await credoScoreRegistry.connect(oracle1).updateScore(user1.address, 750, 2);
      await credoScoreRegistry.connect(oracle1).updateScore(user2.address, 600, 2);
      
      const users = [user1.address, user2.address];
      expect(await credoScoreRegistry.getActiveScoreCount(users)).to.equal(2);
      
      await credoScoreRegistry.connect(oracle1).deactivateScore(user1.address);
      expect(await credoScoreRegistry.getActiveScoreCount(users)).to.equal(1);
    });
  });
});