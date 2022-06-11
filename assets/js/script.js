
// Test variables
// TODO: replace with calls to functions that return api data when complete
const symbol = "btc";
const currentPrice = 20000;

// TODO: read these values from client side storage
// hardcoded for now
let savedPurchasePrice = 10000;
let savedQuantity = 5;
let availableCash = 100000;


function createCoinRow(ticker, purchasePrice, quantity) {
  var newRow = document.createElement('div');
  newRow.setAttribute("id", symbol);

  // TODO: write logic to check the previous coin's color (class var) & alternate colors
  // for now, we hardcode "coin coin1"
  newRow.setAttribute("class", "coin coin1");

  var newSymbol = document.createElement('h5');
  newSymbol.setAttribute("id", symbol + "-symbol");
  newSymbol.textContent = ticker;

  var newCurrentValue = document.createElement('h5');
  newCurrentValue.setAttribute("id", symbol + "-current-value");
  newCurrentValue.textContent = currentPrice * quantity;

  var newQuantity = document.createElement('h5');
  newQuantity.setAttribute("id", symbol + "-quantity");
  newQuantity.textContent = quantity;

  // TODO: call api to calculate a value for this
  var newTodayGainLoss = document.createElement('h5');
  newTodayGainLoss.setAttribute("id", symbol + "-today-gl");
  newTodayGainLoss.textContent = "TODO: Fix this";

  var newTotalGainLoss = document.createElement('h5');
  newTotalGainLoss.setAttribute("id", symbol + "-total-gl");
  newTotalGainLoss.textContent = (quantity * (currentPrice - purchasePrice)).toFixed(2)

  newRow.append(newSymbol, newCurrentValue, newQuantity, newTodayGainLoss, newTotalGainLoss);

  document.getElementById("portfolio-total").before(newRow);
}


function updateCoinRow(ticker, costBasis, quantity) {
  document.getElementById(ticker + "-current-value").textContent = currentPrice * quantity;
  document.getElementById(ticker + "-quantity").textContent = quantity;

  // TODO: call api to calculate a value for this
  document.getElementById(ticker + "-today-gl").textContent = "TODO: Fix this v2";

  document.getElementById(ticker + "-total-gl").textContent = (quantity * (currentPrice - costBasis)).toFixed(2);
}


// Deletes a row 
function deleteRow(ticker) {
  document.getElementById(ticker).remove();
}


// Updates the available cash display
function updateCash(x) {
  document.getElementById("cash").textContent = x;
}


// Rounds to 6 decimal places. Solves numerical drift from JS floats
// & allows us to only store a calculated cost basis + qty, instead of storing an array of transactions
function round(x) {
  return Math.round(x * 1000000) / 1000000;
}


document.getElementById("buy").onclick = function () {
  const quantity = parseFloat(document.getElementById("amount").value, 10);

  // TODO: display some error
  if (quantity * currentPrice > availableCash) {
    console.log("insufficient cash to purchase");
    return;
  }

  // TODO: display some error
  if (quantity <= 0) {
    console.log("you're not allowed to buy/sell zero or negatives")
    return;
  }

  // TODO: If ticker exists in client side storage, then we update the row instead of making a new one
  // for now, we just check our variables
  if (symbol != null && savedPurchasePrice != null && savedQuantity != null) {

    // Calculate the new values to display
    let newCostBasis = ((savedPurchasePrice * savedQuantity) + (currentPrice * quantity)) / (savedQuantity + quantity);
    newCostBasis = round(newCostBasis) // JS floats...
    let newQuantity = savedQuantity + quantity;
    newQuantity = round(newQuantity);

    updateCoinRow(symbol, newCostBasis, newQuantity)

    // TODO: save data in client side storage
    // for now, we save to global variables
    savedPurchasePrice = newCostBasis;
    savedQuantity = newQuantity;
  }
  else {
    createCoinRow(symbol, currentPrice, quantity);

    // TODO: save data in client side storage
    // for now, we save to global variables
    savedPurchasePrice = round(currentPrice);
    savedQuantity = round(quantity);
  }

  availableCash = round(availableCash - (currentPrice * quantity));
  updateCash(availableCash);

};


document.getElementById("sell").onclick = function () {
  const quantity = parseFloat(document.getElementById("amount").value, 10);

  // TODO: If statement should check if ticker exists in client side storage
  // for now, we just check our variables
  if (symbol != null && savedPurchasePrice != null && savedQuantity != null) {

    // We do not allow people to short
    // TODO: display some error
    if (quantity > savedQuantity) {
      console.log("you can't sell more of this symbol than you own");
      return;
    }

    // TODO: display some error
    if (quantity <= 0) {
      console.log("you're not allowed to buy/sell zero or negatives")
      return;
    }

    if (savedQuantity - quantity == 0) {
      deleteRow(symbol)

      // TODO: save data in client side storage
      // for now, we save to global variables
      savedPurchasePrice = null;
      savedQuantity = null;
      availableCash = round(availableCash + (currentPrice * quantity));      
    }
    else {
      let newCostBasis = ((savedPurchasePrice * savedQuantity) - (currentPrice * quantity)) / (savedQuantity - quantity);
      newCostBasis = round(newCostBasis); // JS floats...
      let newQuantity = savedQuantity - quantity;
      newQuantity = round(newQuantity);

      updateCoinRow(symbol, newCostBasis, newQuantity)

      // TODO: save data in client side storage
      // for now, we save to global variables
      savedPurchasePrice = newCostBasis;
      savedQuantity = newQuantity;
      availableCash = round(availableCash + (currentPrice * quantity));
    }
    updateCash(availableCash);
  }
  else {
    // TODO: display some error
    console.log("you don't own this coin")
  }
};


// TODO: this if statement should check client side storage for saved data
// if any exist, we generate html & display them
// else, we should generate client side storage
if (symbol != null && savedPurchasePrice != null && savedQuantity != null) {
  createCoinRow(symbol, savedPurchasePrice, savedQuantity);
  updateCash(availableCash);
}