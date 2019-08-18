App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {

    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error("User denied account access")
      }
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {

    $.getJSON('ABCoinContract.json', function (data) {
      var ABCoinContractArtifact = data;
      App.contracts.ABCoinContract = TruffleContract(ABCoinContractArtifact);
      App.contracts.ABCoinContract.setProvider(App.web3Provider);
      return App.loadOnStartup();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-show-balance', App.showTotalSupply);
    $(document).on('click', '.btn-issue-token', App.issueTokens);
  },

  loadOnStartup: function (event) {
    var abcoinInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.ABCoinContract.deployed().then(function (instance) {
        abcoinInstance = instance;
        return abcoinInstance.totalSupply({ from: account });
      }).then(function (result) {
        $('#adminTemplate').find('.total-supply').text(`${result}`);
        console.log("Total Supply", `${result}`);
        return true;
      }).catch(function (err) {
        console.log(err.message);
      });
    });

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.ABCoinContract.deployed().then(function (instance) {
        abcoinInstance = instance;
        return abcoinInstance.balanceOf('0xDEC548BA4f54Cb5CfA6a09077b55DaDa9762d922', { from: account });
      }).then(function (result) {
        $('#adminTemplate').find('.balance-at').text(`${result}`);
        console.log("Balance at", `${result}`);
        return true;
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  issueTokens: function (event) {
  event.preventDefault();

      var abcoinInstance;
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
        var account = accounts[0];
        App.contracts.ABCoinContract.deployed().then(function (instance) {
          abcoinInstance = instance;
          return abcoinInstance.issueTokens({ from: account });
        }).then(function (result) {
          console.log("issueTokens", `${result}`);
          return App.loadOnStartup();
        }).catch(function (err) {
          console.log(err.message);
        });
      });
    }




};

$(function () {
  $(window).load(function () {
    App.init();
  });
});