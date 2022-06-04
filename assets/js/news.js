// Using this API: https://newsdata.io/api-key
// Add API key to config.js

// Div to target id="news"
var newsContainer = document.getElementById('news');

// Expecting a string arg of a crypto ticker. ie: btc, eth, xrp
function newsApi(ticker)
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
        
        // Outputs response to console
        // TODO: remove this prior to release
        console.log(data);

        console.log(data.results.length);
        for (let i = 0; i < data.results.length; i++) {
            var articleTitle = document.createElement('h3');
            var articleAuthor = document.createElement('h4');
            var articleBody = document.createElement('p');
    
            // Set title content
            articleTitle.textContent = data.results[i].title;

            // Set author content
            articleAuthor.textContent = data.results[i].creator[0] + " from " + data.results[i].source_id;
            
            // We check for results.content being null
            // This api returns some articles with content == null & something in results.description
            if (data.results[i].content != null) {
                var content = data.results[i].content;
            }
            else {
                var content = data.results[i].description;
            }

            // We cap article body length at 1k chars for UI purposes & set body content
            if (content.length > 1000) {
                articleBody.textContent = content.slice(0,1000) + " [...]"; }
            else {
                articleBody.textContent = content;
            }
            
            // Append
            newsContainer.append(articleTitle);
            newsContainer.append(articleAuthor);
            newsContainer.append(articleBody);
            
            // Append a link to the full article
            newsContainer.insertAdjacentHTML('beforeend', "<a href=\"" + data.results[i].link + "\">Full article</a>"); 
        }
      })
      .catch(function (error) {
        console.log('error', error);
        var articleError = document.createElement('p');
        articleError.textContent = error;
        newsContainer.append(articleError);
      })
  }

  // Test calls
  // TODO: remove this when UI can call newsApi()
  newsApi("eth");