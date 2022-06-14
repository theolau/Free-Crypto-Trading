// This is the current working symbol
var symbol;

// We can set the default portfolio here
const defaultSymbol = "bitcoin";
var portfolioData = {};
var availableCash = 250000;

// Returns the current price of a coin
function currentPrice(ticker) {
  if (priceMap[ticker]) {
    return priceMap[ticker].price;
  }
  else { return 0; }
}

// Creates a new row when purchasing of a coin or when loading saved data
function createCoinRow(ticker, purchasePrice, quantity) {
  let newRow = document.createElement('tr');
  newRow.setAttribute("id", ticker);

  let newSymbol = document.createElement('td');
  newSymbol.setAttribute("id", ticker + "-symbol");
  newSymbol.textContent = symbolToName(ticker);

  let newCurrentValue = document.createElement('td');
  newCurrentValue.setAttribute("id", ticker + "-current-value");
  newCurrentValue.textContent = "$" + (currentPrice(ticker) * quantity).toFixed(2);

  let newQuantity = document.createElement('td');
  newQuantity.setAttribute("id", ticker + "-quantity");
  newQuantity.textContent = quantity;

  let newPricePerCoin = document.createElement('td');
  newPricePerCoin.setAttribute("id", ticker + "-current-price");
  newPricePerCoin.textContent = "$" + currentPrice(ticker);

  let newTotalGainLoss = document.createElement('td');
  newTotalGainLoss.setAttribute("id", ticker + "-total-gl");
  newTotalGainLoss.textContent = "$" + (quantity * (currentPrice(ticker) - purchasePrice)).toFixed(2)

  newRow.append(newSymbol, newCurrentValue, newQuantity, newPricePerCoin, newTotalGainLoss);

  document.getElementById("portfolio-table").append(newRow);
}

// Updates a row on coin purchase/sale
function updateCoinRow(ticker, costBasis, quantity) {
  document.getElementById(ticker + "-current-value").textContent = "$" + (currentPrice(ticker) * quantity).toFixed(2);
  document.getElementById(ticker + "-quantity").textContent = quantity;
  document.getElementById(ticker + "-current-price").textContent = "$" + currentPrice(ticker);
  document.getElementById(ticker + "-total-gl").textContent = "$" + (quantity * (currentPrice(ticker) - costBasis)).toFixed(2);
}

// Deletes a row 
function deleteRow(ticker) { document.getElementById(ticker).remove(); }

// Updates the available cash display
function updateCash(x) { document.getElementById("cash").textContent = "$" + x.toFixed(2); }

// Updates the portfolio total value display
function updatePortfolioTotal() {
  let portfolioSum = 0;
  for (const x in portfolioData) {
    portfolioSum += currentPrice(x) * portfolioData[x].savedQuantity;
  }
  document.getElementById("portfolio-total").textContent = "$" + (availableCash + portfolioSum).toFixed(2);
}

// Updates the price display for the current symbol
function updatePrice() { document.getElementById("price").textContent = "$" + currentPrice(symbol); }


// Takes a coin id (see: coingecko documentation) and outputs the full name
function symbolToName(x) {
  if (priceMap[x]) { return priceMap[x].name; }
  else {
    openModal("Error, can't lookup symbol");
    return "";
  }
}

// Updates the current symbol box
function updateSymbol() { document.getElementById("symbol").textContent = symbolToName(symbol); }

// Updates the whole page
function updateWholePage() {
  for (const x in portfolioData) {
    updateCoinRow(x, portfolioData[x]["savedPurchasePrice"], portfolioData[x]["savedQuantity"]);
  }
  updatePortfolioTotal();
  updatePrice();
  updateSymbol();
}

function pageRefresh() {
  cgPriceUpdate(priceMap);
  updateWholePage();
}
// Updates prices (API call) & refreshes the page every 15 seconds
setInterval(pageRefresh, 15000);


// Rounds to 10 decimal places. Solves numerical drift from JS floats
// & allows us to only store a calculated cost basis + qty, instead of storing a log of transactions
function round(x) { return Math.round(x * 10000000000) / 10000000000; }


// Update the transaction price box as the user types
$('#amount').on('keyup change textInput input', function () {
  if (this.value == 0) { document.getElementById("total-price").textContent = "$0.00"; }
  else { document.getElementById("total-price").textContent = "$" + (parseFloat(this.value, 10) * currentPrice(symbol)).toFixed(2); }
});



document.getElementById("buy").onclick = function () {
  if (document.getElementById("amount").value == "") {
    openModal("You're not allowed to buy zero coins.");
    return;
  }

  const quantity = parseFloat(document.getElementById("amount").value, 10);

  if (quantity * currentPrice(symbol) > availableCash) {
    openModal("Insufficient cash to purchase.");
    return;
  }

  if (quantity <= 0) {
    openModal("You're not allowed to buy zero or negatives coins.")
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
      openModal("You can't sell more of than you own. Short sales are not allowed.");
      return;
    }

    if (!quantity) {
      openModal("You're not allowed to sell zero coins.")
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
  else { openModal("You don't own any of this coin to sell.") }
};

// Clear memory button - clears all local data & resets page to defaults
document.getElementById("clear-memory").onclick = function () {
  localStorage.clear();
  for (const x in portfolioData) { deleteRow(x); }
  portfolioData = {};
  availableCash = 250000;
  symbol = defaultSymbol;
  newsApi(symbolToName(symbol));
  updatePrice();
  updateSymbol();
  openModal("Client data has been successfully cleared.");
};


// Initialization parameters for select2
$('#bar').select2({
  dropdownParent: $('#search-sec'), // Fixes parent - copied from select2 documentation
  data: coins // array of coins in supportedcoins.js
});

// Function triggered on selection
$('#bar').on('select2:select', function (e) {
  let data = e.params.data;
  symbol = data.id;
  newsApi(symbolToName(symbol));
  updateWholePage();
  drawChart();
});


// Modal
var modal = document.getElementById("error-modal");

// Close the modal when clicking the X
document.getElementById("close").onclick = function () { modal.style.display = "none"; }

// Close the modal when clicking out
window.onclick = function (x) { if (x.target == modal) { modal.style.display = "none"; } }

// Function for opening modal + displaying some text
function openModal(input) {
  modal.style.display = "block";
  document.getElementById("modal-text").textContent = input;
}


// Gets price data & page initialization procedures
var priceMap = {};
cgPriceInitialization();

// Set default symbol
symbol = defaultSymbol;

// Chart
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);