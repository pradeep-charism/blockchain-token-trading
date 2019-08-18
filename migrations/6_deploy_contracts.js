var ABCoin = artifacts.require("./ABCoin.sol");
module.exports = function(deployer) {
  deployer.deploy(Owned);
};
