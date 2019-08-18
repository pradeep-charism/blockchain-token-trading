const CoinCompany = artifacts.require('./CoinCompany.sol');

module.exports = async function (deployer, network, accounts) {
    const wallet = accounts[0];
    let _token;
    await deployer.deploy(CoinCompany, wallet)
        .then(instance => {
            _token = instance.address;
            console.log ("ABCoin is created at address", _token);
        });
 };