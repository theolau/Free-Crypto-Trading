/*
function getApi() {
  console.log(config);
  const myHeaders = new Headers();
  myHeaders.append("apikey", config.API_KEY);
  
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: myHeaders
  };
  fetch("https://api.apilayer.com/currency_data/change?start_date=2018-08-08&end_date=2018-08-15", requestOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Use the console to examine the response
      console.log(data);
      // TODO: Loop through the data and generate your HTML
    })
    .catch(error => console.log('error', error));
}
getApi();
*/