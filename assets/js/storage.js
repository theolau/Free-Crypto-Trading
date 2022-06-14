function saveToPersistent() {
     localStorage.setItem("pData", JSON.stringify(portfolioData));
     localStorage.setItem("pCash", JSON.stringify(availableCash));
    }

function initializeFromPersistent() {
    if (localStorage.getItem("pData") != null) { portfolioData = JSON.parse(localStorage.getItem("pData")); } 
    if (localStorage.getItem("pCash") != null) { availableCash = JSON.parse(localStorage.getItem("pCash")); }
}