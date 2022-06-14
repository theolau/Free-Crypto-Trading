function cgPriceUpdate() {
    const requestOptions = {
        method: 'GET',
        headers: { 'accept': 'application/json', }
    };
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin%2Cethereum%2Ctether%2Cusd-coin%2Cbinancecoin%2Cbinance-usd%2Ccardano%2Cripple%2Csolana%2Cpolkadot%2Cdogecoin%2Cdai%2Cwrapped-bitcoin%2Ctron%2Cleo-token%2Cstaked-ether%2Cshiba-inu%2Cavalanche-2%2Cftx-token%2Clitecoin%2Cmatic-network%2Cchainlink%2Ccrypto-com-chain%2Cokb%2Cstellar%2Cnear%2Cbitcoin-cash%2Cmonero%2Calgorand%2Cethereum-classic%2Ccosmos%2Ctheta-fuel%2Cvechain%2Cuniswap%2Cflow%2Cfrax%2Chedera-hashgraph%2Cinternet-computer%2Ctezos%2Cdecentraland%2Cfilecoin%2Ctrue-usd%2Ctheta-token%2Caxie-infinity%2Ckucoin-shares%2Cthe-sandbox%2Capecoin%2Celrond-erd-2%2Cbitcoin-cash-sv%2Ccompound-usd-coin&order=market_cap_desc&per_page=250&page=1&sparkline=false";
    fetch(url, requestOptions)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            for (var i = 0; i < data.length; i++) {
                newMap[data[i].id] = {"price": data[i].current_price, "name": data[i].name};
            }
            console.log(newMap);
        })
        .catch(function (error) {
            console.log('error', error);
        })
}
var newMap = {};
cgPriceUpdate();