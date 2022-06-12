// This is the current working symbol
var symbol = "btc";

// TODO: delete when current price gets real data
function rand(x, y) { return (Math.round((Math.random() * y + x) * 100) / 100); }

// Returns the current price of a coin - currently using randomised data cached for 15 seconds
// TODO: this function needs to call our API and return a current price for a given coin
// this function should probably cache a price for a short period as well, because we call it a lot
var lastPrice = {};
for (let i = 0; i < coins.length; i++) { // temp - randomizes prices at start
  lastPrice[coins[i].id] = rand(0.01, 25000);
}
function currentPrice(ticker) {
  if (lastPrice[ticker]) { return lastPrice[ticker]; }
  else { return 999999; }
}

// TODO: read these values from client side storage
// hardcoded for now
var portfolioData = {
  btc: { savedPurchasePrice: 10000, savedQuantity: 5 },
  eth: { savedPurchasePrice: 1500, savedQuantity: 12 }
};
let availableCash = 100000;


function createCoinRow(ticker, purchasePrice, quantity) {
  var newRow = document.createElement('div');
  newRow.setAttribute("id", ticker);

  // TODO: write logic to check the previous coin's color (class var) & alternate colors
  // for now, we hardcode "coin coin1"
  newRow.setAttribute("class", "coin coin1");

  var newSymbol = document.createElement('h5');
  newSymbol.setAttribute("id", ticker + "-symbol");
  newSymbol.textContent = ticker;

  var newCurrentValue = document.createElement('h5');
  newCurrentValue.setAttribute("id", ticker + "-current-value");
  newCurrentValue.textContent = "$" + (currentPrice(ticker) * quantity).toFixed(2);

  var newQuantity = document.createElement('h5');
  newQuantity.setAttribute("id", ticker + "-quantity");
  newQuantity.textContent = quantity;

  // TODO: call api to calculate a value for this
  var newTodayGainLoss = document.createElement('h5');
  newTodayGainLoss.setAttribute("id", ticker + "-today-gl");
  newTodayGainLoss.textContent = "TODO: Fix this";

  var newTotalGainLoss = document.createElement('h5');
  newTotalGainLoss.setAttribute("id", ticker + "-total-gl");
  newTotalGainLoss.textContent = "$" + (quantity * (currentPrice(ticker) - purchasePrice)).toFixed(2)

  newRow.append(newSymbol, newCurrentValue, newQuantity, newTodayGainLoss, newTotalGainLoss);

  document.getElementById("portfolio-total-row").before(newRow);
}


function updateCoinRow(ticker, costBasis, quantity) {
  document.getElementById(ticker + "-current-value").textContent = "$" + (currentPrice(ticker) * quantity).toFixed(2);
  document.getElementById(ticker + "-quantity").textContent = quantity;

  // TODO: call api to calculate a value for this
  document.getElementById(ticker + "-today-gl").textContent = "TODO: Fix this";

  document.getElementById(ticker + "-total-gl").textContent = "$" + (quantity * (currentPrice(ticker) - costBasis)).toFixed(2);
}


// Deletes a row 
function deleteRow(ticker) {
  document.getElementById(ticker).remove();
}


// Updates the available cash display
function updateCash(x) {
  document.getElementById("cash").textContent = "$" + x.toFixed(2);
}


// Updates the portfolio total value display
function updatePortfolioTotal() {
  var portfolioSum = 0;
  for (const x in portfolioData) {
    portfolioSum += currentPrice(x) * portfolioData[x].savedQuantity;
  }
  document.getElementById("portfolio-total").textContent = "$" + (availableCash + portfolioSum).toFixed(2);
}

function updatePrice() {
  document.getElementById("price").textContent = "$" + currentPrice(symbol).toFixed(2);
  console.log("$" + currentPrice(symbol).toFixed(2));
}

/* Yes, I know this is terrible code and this is the poster child for hashmaps.
Unfortunately, select2 requires an array or json input
and it's not worth creating a hashmap of the same data for this purpose only.
Either way, our dataset is small enough to not really care about performance */
function symbolToName() {
  for (let i = 0; i < coins.length; i++) {
    if (coins[i].id == symbol) { return coins[i].text; }
  }
  return "error, can't lookup symbol"
}

function updateSymbol() {
  document.getElementById("symbol").textContent = symbolToName(symbol);
  console.log(symbolToName(symbol));
}

function updateWholePage() {
  for (const x in portfolioData) {
    updateCoinRow(x, portfolioData[x]["savedPurchasePrice"], portfolioData[x]["savedQuantity"]);
  }
  updatePortfolioTotal();
  updatePrice();
  updateSymbol();
}

function pageRefresh() {
  for (let i = 0; i < coins.length; i++) { // for testing purposes, this randomizes the prices
    lastPrice[coins[i].id] = rand(0.01, 25000);
  }
  updateWholePage();
}

// Randomizes prices & refreshes the page every 15 seconds
setInterval(pageRefresh, 15000);


// Rounds to 10 decimal places. Solves numerical drift from JS floats
// & allows us to only store a calculated cost basis + qty, instead of storing an array of transactions
function round(x) {
  return Math.round(x * 10000000000) / 10000000000;
}


//document.getElementById("amount").addEventListener('change', updateValue);

$('#amount').on('keyup change textInput input', function () {
  if (this.value == 0) { document.getElementById("total-price").textContent = "$0.00"; }
  else { document.getElementById("total-price").textContent = "$" + (parseFloat(this.value, 10) * currentPrice(symbol)).toFixed(2); }
});

document.getElementById("buy").onclick = function () {
  const quantity = parseFloat(document.getElementById("amount").value, 10);

  // TODO: display some error
  if (quantity * currentPrice(symbol) > availableCash) {
    console.log("insufficient cash to purchase");
    return;
  }

  // TODO: display some error
  if (quantity <= 0) {
    console.log("you're not allowed to buy/sell zero or negatives")
    return;
  }

  if (portfolioData[symbol] != null) {

    // Calculate the new values to display
    let newCostBasis = ((portfolioData[symbol]["savedPurchasePrice"] * portfolioData[symbol]["savedQuantity"]) + (currentPrice(symbol) * quantity)) / (portfolioData[symbol]["savedQuantity"] + quantity);
    newCostBasis = round(newCostBasis) // JS floats...
    let newQuantity = portfolioData[symbol]["savedQuantity"] + quantity;
    newQuantity = round(newQuantity);

    updateCoinRow(symbol, newCostBasis, newQuantity)
    portfolioData[symbol]["savedPurchasePrice"] = round(newCostBasis);
    portfolioData[symbol]["savedQuantity"] = newQuantity;
  }
  else {
    createCoinRow(symbol, currentPrice(symbol), quantity);
    portfolioData[symbol] = { savedPurchasePrice: round(currentPrice(symbol)), savedQuantity: round(quantity) };
  }

  availableCash = round(availableCash - (currentPrice(symbol) * quantity));
  updateCash(availableCash);
  updatePortfolioTotal();
  updatePrice();
  saveToPersistent();
};


document.getElementById("sell").onclick = function () {
  const quantity = parseFloat(document.getElementById("amount").value, 10);

  if (symbol != null && portfolioData[symbol]) {

    // We do not allow people to short
    // TODO: display some error
    if (quantity > portfolioData[symbol]["savedQuantity"]) {
      console.log("you can't sell more of this symbol than you own");
      return;
    }

    // TODO: display some error
    if (quantity <= 0) {
      console.log("you're not allowed to buy/sell zero or negatives")
      return;
    }

    if (portfolioData[symbol]["savedQuantity"] - quantity == 0) {
      deleteRow(symbol)
      delete portfolioData[symbol];
      availableCash = round(availableCash + (currentPrice(symbol) * quantity));

    }
    else {
      let newCostBasis = ((portfolioData[symbol]["savedPurchasePrice"] * portfolioData[symbol]["savedQuantity"]) - (currentPrice(symbol) * quantity)) / (portfolioData[symbol]["savedQuantity"] - quantity);
      newCostBasis = round(newCostBasis);
      let newQuantity = portfolioData[symbol]["savedQuantity"] - quantity;
      newQuantity = round(newQuantity);

      updateCoinRow(symbol, newCostBasis, newQuantity)

      portfolioData[symbol]["savedPurchasePrice"] = newCostBasis;
      portfolioData[symbol]["savedQuantity"] = newQuantity;
      availableCash = round(availableCash + (currentPrice(symbol) * quantity));
    }
    updateCash(availableCash);
    updatePortfolioTotal();
    updatePrice();
    saveToPersistent();
  }
  else {
    // TODO: display some error
    console.log("you don't own this coin")
  }
};


// Initialization parameters for select2
$('#bar').select2({
  dropdownParent: $('#search-sec'), // Fixes parent - copied from select2 documentation
  data: coins // array of coins in supportedcoins.js
});


// Function triggered on selection
$('#bar').on('select2:select', function (e) {
  var data = e.params.data;
  symbol = data.id;
  newsApi(symbol);
  updateWholePage();
});


// If we have saved data, then we initialize it & write to memory
initializeFromPersistent();
for (const x in portfolioData) {
  symbol = x;
  createCoinRow(symbol, portfolioData[x].savedPurchasePrice, portfolioData[x].savedQuantity);
}
updateCash(availableCash);
updatePortfolioTotal();

// Set default symbol to btc
symbol = "btc";
newsApi(symbol);
updatePrice();
updateSymbol();