App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    $.getJSON('../shop-items.json', function (data) {
      var shopsRow = $('#shopsRow');
      var shopTemplate = $('#shopTemplate');

      for (i = 0; i < data.length; i++) {
        shopTemplate.find('.panel-title').text(data[i].name);
        shopTemplate.find('img').attr('src', data[i].picture);
        shopTemplate.find('.shop-desc').text(data[i].desc);
        shopTemplate.find('.shop-cost').text(data[i].cost);
        shopTemplate.find('.shop-location').text(data[i].location);
        shopTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        shopTemplate.find('.btn-release').attr('data-id', data[i].id).attr('disabled', true);


        shopsRow.append(shopTemplate.html());
      }
    });

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

    $.getJSON('Adoption.json', function (data) {
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-release', App.handleRelease);
  },

  markAdopted: function (adopters, account) {

    var adoptionInstance;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;
      return adoptionInstance.getAdopters.call();
    }).then(function (adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-shop').eq(i).find('.btn-adopt').text('Buy').attr('disabled', true);
          $('.panel-shop').eq(i).find('.btn-release').text('Sell').attr('disabled', false);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  handleAdopt: function (event) {
    event.preventDefault();

    var shopId = parseInt($(event.target).data('id'));


    var adoptionInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Adoption.deployed().then(function (instance) {
        adoptionInstance = instance;
        return adoptionInstance.adopt(shopId, { from: account, data: shopId });
      }).then(function (result) {
        return App.markAdopted();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  markReleased: function (adopters, account) {

    var adoptionInstance;
    App.contracts.Adoption.deployed().then(function (instance) {
      adoptionInstance = instance;
      return adoptionInstance.getAdopters.call();
    }).then(function (adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] === '0x0000000000000000000000000000000000000000') {
          $('.panel-shop').eq(i).find('.btn-adopt').text('Buy').attr('disabled', false);
          $('.panel-shop').eq(i).find('.btn-release').text('Sell').attr('disabled', true);
        }
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  handleRelease: function (event) {
    event.preventDefault();

    var shopId = parseInt($(event.target).data('id'));


    var adoptionInstance;
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.Adoption.deployed().then(function (instance) {
        adoptionInstance = instance;
        return adoptionInstance.release(shopId, { from: account });
      }).then(function (result) {
        return App.markReleased();
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
