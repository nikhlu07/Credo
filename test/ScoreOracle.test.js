const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ScoreOracle", function () {
  let scoreOracle;
  let mockRegistry;
  let owner;
  let signer1;
  let signer2;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, signer1, signer2, user1, user2] = await ethers.getSigners();

    // Deploy mock registry
    const MockRegistry = await ethers.getContractFactory("CredoScoreRegistry");
    mockRegistry = await MockRegistry.deploy();
    await mockRegistry.waitForDeployment();

    // Deploy oracle
    const ScoreOracle = await ethers.getContractFactory("ScoreOracle");
    scoreOracle = await ScoreOracle.deploy(await mockRegistry.getAddress());
    await scoreOracle.waitForDeployment();

    // Authorize oracle in registry
    await mockRegistry.setOracleAuthorization(await scoreOracle.getAddress(), true);
  });

  describe("Deployment", function () {
    it("Should set the correct registry address", async function () {
      expect(await scoreOracle.scoreRegistry()).to.equal(await mockRegistry.getAddress());
    });

    it("Should authorize owner as signer by default", async function () {
      expect(await scoreOracle.authorizedSigners(owner.address)).to.be.true;
    });

    it("Should initialize nonces to zero", async function () {
      expect(await scoreOracle.getCurrentNonce(user1.address)).to.equal(0);
    });
  });

  describe("Signer Authorization", function () {
    it("Should allow owner to authorize signers", async function () {
      await expect(scoreOracle.setSignerAuthorization(signer1.address, true))
        .to.emit(scoreOracle, "SignerAuthorized")
        .withArgs(signer1.address, true);

      expect(await scoreOracle.authorizedSigners(signer1.address)).to.be.true;
    });

    it("Should allow owner to deauthorize signers", async function () {
      await scoreOracle.setSignerAuthorization(signer1.address, true);
      
      await expect(scoreOracle.setSignerAuthorization(signer1.address, false))
        .to.emit(scoreOracle, "SignerAuthorized")
        .withArgs(signer1.address, false);

      expect(await scoreOracle.authorizedSigners(signer1.address)).to.be.false;
    });

    it("Should revert when non-owner tries to authorize signer", async function () {
      await expect(
        scoreOracle.connect(signer1).setSignerAuthorization(signer2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Score Update Signatures", function () {
    let deadline;
    let nonce;

    beforeEach(async function () {
      deadline = (await time.latest()) + 3600; // 1 hour from now
      nonce = await scoreOracle.getCurrentNonce(user1.address);
    });

    async function createValidSignature(user, score, version, nonce, deadline, signer = owner) {
      // Create message hash matching contract logic
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "address", "uint256", "uint256", "uint256", "uint256"],
        ["ScoreUpdate", user, score, version, nonce, deadline]
      );

      // Sign the message
      const signature = await signer.signMessage(ethers.getBytes(messageHash));
      return signature;
    }

    it("Should accept valid signed score update", async function () {
      const score = 750;
      const version = 2;
      
      const signature = await createValidSignature(user1.address, score, version, nonce, deadline);
      
      const update = {
        user: user1.address,
        score: score,
        version: version,
        nonce: nonce,
        deadline: deadline
      };

      await expect(scoreOracle.submitScoreUpdate(update, signature))
        .to.emit(scoreOracle, "ScoreUpdateSubmitted")
        .withArgs(user1.address, score, version, owner.address, nonce);

      // Check that nonce was incremented
      expect(await scoreOracle.getCurrentNonce(user1.address)).to.equal(nonce + 1);
    });

    it("Should revert with invalid signature", async function () {
      const score = 750;
      const version = 2;
      
      // Create signature with wrong signer
      const signature = await createValidSignature(user1.address, score, version, nonce, deadline, signer1);
      
      const update = {
        user: user1.address,
        score: score,
        version: version,
        nonce: nonce,
        deadline: deadline
      };

      await expect(scoreOracle.submitScoreUpdate(update, signature))
        .to.be.revertedWithCustomError(scoreOracle, "UnauthorizedSigner");
    });

    it("Should revert with expired deadline", async function () {
      const score = 750;
      const version = 2;
      const expiredDeadline = (await time.latest()) - 1; // Already expired
      
      const signature = await createValidSignature(user1.address, score, version, nonce, expiredDeadline);
      
      const update = {
        user: user1.address,
        score: score,
        version: version,
        nonce: nonce,
        deadline: expiredDeadline
      };

      await expect(scoreOracle.submitScoreUpdate(update, signature))
        .to.be.revertedWithCustomError(scoreOracle, "ExpiredDeadline");
    });

    it("Should revert with invalid nonce", async function () {
      const score = 750;
      const version = 2;
      const wrongNonce = nonce + 1;
      
      const signature = await createValidSignature(user1.address, score, version, wrongNonce, deadline);
      
      const update = {
        user: user1.address,
        score: score,
        version: version,
        nonce: wrongNonce,
        deadline: deadline
      };

      await expect(scoreOracle.submitScoreUpdate(update, signature))
        .to.be.revertedWithCustomError(scoreOracle, "InvalidNonce");
    });

    it("Should revert with invalid score", async function () {
      const invalidScore = 1001; // Over maximum
      const version = 2;
      
      const signature = await createValidSignature(user1.address, invalidScore, version, nonce, deadline);
      
      const update = {
        user: user1.address,
        score: invalidScore,
        version: version,
        nonce: nonce,
        deadline: deadline
      };

      await expect(scoreOracle.submitScoreUpdate(update, signature))
        .to.be.revertedWithCustomError(scoreOracle, "InvalidScore");
    });

    it("Should revert with zero address", async function () {
      const score = 750;
      const version = 2;
      
      const signature = await createValidSignature(ethers.ZeroAddress, score, version, nonce, deadline);
      
      const update = {
        user: ethers.ZeroAddress,
        score: score,
        version: version,
        nonce: nonce,
        deadline: deadline
      };

      await expect(scoreOracle.submitScoreUpdate(update, signature))
        .to.be.revertedWithCustomError(scoreOracle, "InvalidUser");
    });
  });

  describe("Batch Score Updates", function () {
    let deadline;
    let batchNonce;

    beforeEach(async function () {
      deadline = (await time.latest()) + 3600;
      batchNonce = await scoreOracle.getCurrentNonce(owner.address);
    });

    async function createBatchSignature(users, scores, version, nonce, deadline, signer = owner) {
      // Create message hash for batch update
      const usersHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address[]"], [users]));
      const scoresHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [scores]));
      
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "bytes32", "bytes32", "uint256", "uint256", "uint256"],
        ["BatchScoreUpdate", usersHash, scoresHash, version, nonce, deadline]
      );

      return await signer.signMessage(ethers.getBytes(messageHash));
    }

    it("Should accept valid batch score update", async function () {
      const users = [user1.address, user2.address];
      const scores = [600, 750];
      const version = 2;
      
      const signature = await createBatchSignature(users, scores, version, batchNonce, deadline);

      await expect(
        scoreOracle.submitBatchScoreUpdate(users, scores, version, batchNonce, deadline, signature)
      ).to.emit(scoreOracle, "BatchScoreUpdateSubmitted")
        .withArgs(users.length, version, owner.address, batchNonce);

      // Check nonce was incremented
      expect(await scoreOracle.getCurrentNonce(owner.address)).to.equal(batchNonce + 1);
    });

    it("Should revert batch with mismatched array lengths", async function () {
      const users = [user1.address, user2.address];
      const scores = [600]; // Different length
      const version = 2;
      
      const signature = await createBatchSignature(users, scores, version, batchNonce, deadline);

      await expect(
        scoreOracle.submitBatchScoreUpdate(users, scores, version, batchNonce, deadline, signature)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("Should revert batch with invalid batch size", async function () {
      const users = new Array(101).fill(user1.address);
      const scores = new Array(101).fill(500);
      const version = 2;
      
      const signature = await createBatchSignature(users, scores, version, batchNonce, deadline);

      await expect(
        scoreOracle.submitBatchScoreUpdate(users, scores, version, batchNonce, deadline, signature)
      ).to.be.revertedWith("Invalid batch size");
    });
  });

  describe("Hash Generation", function () {
    it("Should generate correct score update hash", async function () {
      const update = {
        user: user1.address,
        score: 750,
        version: 2,
        nonce: 0,
        deadline: (await time.latest()) + 3600
      };

      const contractHash = await scoreOracle.getScoreUpdateHash(update);
      
      // Generate expected hash
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "address", "uint256", "uint256", "uint256", "uint256"],
        ["ScoreUpdate", update.user, update.score, update.version, update.nonce, update.deadline]
      );
      const expectedHash = ethers.hashMessage(ethers.getBytes(messageHash));

      expect(contractHash).to.equal(expectedHash);
    });

    it("Should generate correct batch update hash", async function () {
      const users = [user1.address, user2.address];
      const scores = [600, 750];
      const version = 2;
      const nonce = 0;
      const deadline = (await time.latest()) + 3600;

      const contractHash = await scoreOracle.getBatchUpdateHash(users, scores, version, nonce, deadline);
      
      // Generate expected hash
      const usersHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address[]"], [users]));
      const scoresHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256[]"], [scores]));
      
      const messageHash = ethers.solidityPackedKeccak256(
        ["string", "bytes32", "bytes32", "uint256", "uint256", "uint256"],
        ["BatchScoreUpdate", usersHash, scoresHash, version, nonce, deadline]
      );
      const expectedHash = ethers.hashMessage(ethers.getBytes(messageHash));

      expect(contractHash).to.equal(expectedHash);
    });
  });
});