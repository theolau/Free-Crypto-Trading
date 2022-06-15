// Gets the initial price data & calls functions to generate various parts of the page
function cgPriceInitialization() {
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
            for (let i = 0; i < data.length; i++) {
                priceMap[data[i].id] = { "price": data[i].current_price, "name": data[i].name };
            }

            // If we have saved data, then we initialize it & write to memory
            initializeFromPersistent();

            for (const x in portfolioData) {
                symbol = x;
                createCoinRow(symbol, portfolioData[x].savedPurchasePrice, portfolioData[x].savedQuantity);
            }

            symbol = defaultSymbol;
            updateCash(availableCash);
            updatePrice();
            updatePortfolioTotal();
            document.getElementById("symbol").textContent = symbolToName(symbol);
            newsApi(symbolToName(symbol));
        })
        .catch(function (error) {
            console.log('error', error);
        })
}

function cgPriceUpdate(priceMap) {
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
            for (var i = 0; i < data.length; i++) { priceMap[data[i].id] = { "price": data[i].current_price, "name": data[i].name }; }
        })
        .catch(function (error) {
            console.log('error', error);
        })
}


function drawChart() {

    const requestOptions = {
        method: 'GET',
        headers: { 'accept': 'application/json' }
    };
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" + symbol + "&order=market_cap_desc&per_page=100&page=1&sparkline=true";
    fetch(url, requestOptions)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var newTable = new google.visualization.DataTable();
            newTable.addColumn('date', 'X');
            newTable.addColumn('number', 'USD $');

            for (let i = 0; i < data[0].sparkline_in_7d.price.length; i++) {
                let x = new Date();
                momentObj = moment(x).subtract((168 - i), 'hours');
                newDate = momentObj.toDate();
                newTable.addRows([[newDate, data[0].sparkline_in_7d.price[i]]]);
            }

            var options = {
                title: symbolToName(symbol),
                legend: { position: 'bottom' },
                hAxis: {
                    format: 'M/d/yy',
                    gridlines: {
                        count: 15,
                    }
                }
            };

            var chart = new google.visualization.LineChart(document.getElementById('price-chart'));

            chart.draw(newTable, options);

        })
        .catch(function (error) {
            console.log('error', error);
        })
}