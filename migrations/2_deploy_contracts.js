var CoinInterface = artifacts.require("./CoinInterface.sol");
module.exports = function (deployer) {
    deployer.deploy(Adoption);
};