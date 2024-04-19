const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const debounceTime = 900; // milliseconds
let currentSearch = null;
const openAiUrl = "https://api.openai.com/v1/chat/completions";
const openAISuggestion = "https://api.openai.com/v1/completions";

const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${window.OPEN_AI_KEY}`
  };

const debounceFunction = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// const search = async (searchTerm, signal) => {
//   const url = `https://dummyjson.com/products/1`;
//   const response = await fetch(url, { signal });
//   const data = await response.json();
//   return data;
// };

async function getSuggestionList(searchTerm, signal) {
    console.log(signal);
    const sugg = "what is react js";
    const query = `Give me top 3 suggestions related only to web development or UI or full stack development or frontend development or backend development for the keyword '${sugg}' otherwise just reply with "not related to software"`;
    const data = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: query }],
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 500,
      n: 1,
    };
  
    const dataObj = {
      method: "POST",
      cache: "no-cache",
      headers: headers,
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
      signal
    };
  
    try {
      const response = await fetch(openAiUrl, dataObj);
    //   const response = await fetch("http://localhost:3000/", {signal});
      console.log(response);
      const resData = await response.json();
      console.log(resData.choices[0].message.content);
      splitResponseData(resData.choices[0].message);
    } catch (error) {}
  }

const displayResults = (results) => {
  // display search results in the DOM
};

searchInput.addEventListener('input', (event) => {
  const searchTerm = event.target.value.trim();

  if (searchTerm.length < 3) {
    searchResults.innerHTML = '';
    return;
  }

  if (currentSearch) {
    currentSearch.abort();
  }

  const abortController = new AbortController();
  currentSearch = abortController;

  const debouncedSearch = debounceFunction(async (term, signal) => {
    try {
      const results = await getSuggestionList(term, signal);
      displayResults(results);
    } catch (error) {
      console.error(error);
    }
  }, debounceTime);

  debouncedSearch(searchTerm, abortController.signal);
});