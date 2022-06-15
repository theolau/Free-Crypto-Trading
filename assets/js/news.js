// Using this API: https://newsdata.io/api-key
// Add API key to config.js

var newsContainer = document.getElementById('news');

// Expecting a string arg of a crypto name
function newsApi(ticker) {
  const myHeaders = new Headers();
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: myHeaders
  };
  const apiUrl = "https://newsdata.io/api/1/news?language=en&q=" + ticker + "&apikey=" + "pub_8327cb8ec1a3753ce8c64207b5f9d97f5e72"; //newsdata.io api key
  fetch(apiUrl, requestOptions)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Clear all existing news articles
      newsContainer.innerHTML = '';

      for (let i = 0; i < Math.min(data.results.length, 5); i++) {
        var articleTitle = document.createElement('h4');
        articleTitle.setAttribute("class", "news-tittle");
        var articleBody = document.createElement('div');
        articleBody.setAttribute("class", "news-body");

        // Set title content
        articleTitle.textContent = data.results[i].title;

        // Skip any results with both no description and no content field
        if (data.results[i].description == null && data.results[i].content == null) { continue; }

        // We check for results.content being null
        // This api returns some articles with content == null & something in results.description
        if (data.results[i].description != null) {
          var content = data.results[i].description;
        }
        else {
          var content = data.results[i].content;
        }

        // We cap article body length at 500 chars for UI purposes & set body content
        if (content.length > 500) {
          articleBody.textContent = content.slice(0, 500) + "[...]";
        }
        else {
          articleBody.textContent = content;
        }

        // Append
        newsContainer.append(articleTitle);
        newsContainer.append(articleBody);

        // Append a link to the full article
        newsContainer.insertAdjacentHTML('beforeend', "<a style=\"padding: 1% 0%;\" href=\"" + data.results[i].link + "\">Learn more</a>");
      }
    })
    .catch(function (error) {
      console.log('error', error);
      var articleError = document.createElement('p');
      articleError.textContent = error;
      newsContainer.append(articleError);
    })
}