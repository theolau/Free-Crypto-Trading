// Using this API: https://newsdata.io/api-key
// Add API key to config.js

function newsApi(ticker) // Expecting a string arg of a crypto ticker. ie: btc, eth, xrp
{
    const myHeaders = new Headers();
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
      headers: myHeaders
    };
    const apiUrl = "https://newsdata.io/api/1/news?language=en&q=" + ticker + "&apikey=" + config.NEWS_API_KEY;
    fetch(apiUrl, requestOptions)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data); // Outputs response to console

        // TODO: Do something with said data

      })
      .catch(error => console.log('error', error));
  }

  // Test calls
  newsApi("eth");
  newsApi("xrp");