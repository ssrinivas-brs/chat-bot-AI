// DOM Elements
let chatCollapsibleContainer = document.getElementsByClassName("collapsible");
const suggestBtnElement = document.querySelectorAll(".item");
let suggestionContainerElement = document.getElementById("suggestContainer");
let loadingElement = document.getElementById("loaderstate");
let userInputElement = document.getElementById("textInput");
let userInputContainerElement = document.getElementById("userInput");
let chatBarBottomElement = document.getElementById("chat-bar-bottom");
let loadergif = document.getElementById("loadergif");

loadergif.style.display = "none";
suggestionContainerElement.style.display = "flex";
loadingElement.style.display = "none";
let loading = false;
const debounceTime = 600; // milliseconds
let currentSearch = null;

// Open AI chat completion API endpoint
const openAiUrl = "https://api.openai.com/v1/chat/completions";

// set Headers
const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${window.OPEN_AI_KEY}`
};

// toggle class for collapsible
for (let i = 0; i < chatCollapsibleContainer.length; i++) {
  chatCollapsibleContainer[i].addEventListener("click", function () {
    this.classList.toggle("active");

    var content = this.nextElementSibling;

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

// to calculate the time
function getTime() {
  const monthArr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let today = new Date();
  month = monthArr[today.getMonth()];
  todayDate = today.getDate();
  hours = today.getHours();
  minutes = today.getMinutes();
  if (hours < 10) {
    hours = "0" + hours;
  }

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  let time = `${month} ${todayDate} ${hours}:${minutes}`;
  return time;
}

// shows the first message
function firstBotMessage() {
  let firstMessage = "Good Day! Ask me anything related to Software.";
  document.getElementById("botStarterMessage").innerHTML =
    '<p class="botText"><span>' + firstMessage + "</span></p>";
  let time = getTime();
  document.getElementById("chat-timestamp").append(time);
  userInputContainerElement.scrollIntoView(false);
}

firstBotMessage();

// function that displays's suggestion cards, if the input is null then a text is shown
function showSuggestion(suggestion) {
  while (suggestionContainerElement.firstElementChild) {
    suggestionContainerElement.removeChild(
      suggestionContainerElement.firstElementChild
    );
  }
  if (suggestion === null) {
    const txt = "Given text is not related to software technology.";
    const para = document.createElement("p");
    const t = document.createTextNode(txt);
    para.appendChild(t);
    suggestionContainerElement.appendChild(para);
    suggestionContainerElement.style.display = "block";
    chatBarBottomElement.scrollIntoView(true);
    return;
  }
  if (suggestion) {
    for (let i = 0; i < suggestion.length; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add("item");
      const t = document.createTextNode(suggestion[i]);
      btn.appendChild(t);
      btn.title = suggestion[i];
      btn.addEventListener("click", getSuggestionAnswer);
      suggestionContainerElement.appendChild(btn);
    }
    suggestionContainerElement.style.display = "block";
    chatBarBottomElement.scrollIntoView(true);
    return;
  }
}

// this function receives array as input and removes the serial numbers in each item
function removeSerialNumber(text) {
  if (text) {
    const regex = /^\s*\d+\.\s*/gm;
    // Replace serial numbers with empty string
    const cleanedText = text.map((str) => str.replace(regex, ""));
    // Return cleaned text
    return cleanedText;
  } else {
    return null;
  }
}

// for the given input text this function creates suggestion items as array by splitting based on serial numbers
function suggestionItems(inputText) {
  const regex = /^\d+\.\s.+/gm;
  const matches = inputText.match(regex);
  const cleanedText = removeSerialNumber(matches);
  return cleanedText;
}

async function getSuggestionList(sugg, signal) {
  if (sugg.length > 3 && !loading) {
    loadergif.style.display = "block";
    const query = `Please determine whether the following text is related to software technology or not: '${sugg}' If the text is related to software technology, please provide few wh- questions on the topic alone with numbering. If not, simply respond with 'The given query is not related to software technology.'`;
    const data = {
      model: "gpt-3.5-turbo-0301",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: query },
      ],
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
      signal,
    };

    try {
      const response = await fetch(openAiUrl, dataObj);
      const resData = await response.json();
      // console.log(resData);
      // console.log(resData.choices[0].message.content);
      const suggestions = suggestionItems(resData.choices[0].message.content);
      // console.log(suggestions);
      return suggestions;
    } catch (error) {
    } finally {
      loadergif.style.display = "none";
    }
  }
}

//Gets the chat response based on the user input or suggestion item click
async function getResponse() {
  suggestionContainerElement.style.display = "none";
  let userText = userInputElement.value;
  let userHtml = '<p class="userText"><span>' + userText + "</span></p>";
  userInputElement.value = "";
  $("#chatbox").append(userHtml);
  chatBarBottomElement.scrollIntoView(true);

  let chatBotResponse = await getChatBotResponse(userText);
  let botHtml = '<p class="botText"><span>' + chatBotResponse + "</span></p>";
  $("#chatbox").append(botHtml);
  chatBarBottomElement.scrollIntoView(true);
}

// on clicking anyone of suggestion this function is called, and value is set and API is called
function getSuggestionAnswer(e) {
  userInputElement.value = e.target.title;
  getResponse();
}

// if send button is clicked
function sendButton() {
  getResponse();
}

// Event Listener - when enter key is pressed
userInputElement.addEventListener("keypress", function (e) {
  if (e.which == 13) {
    getResponse();
  }
});

// event listener for suggestion items
suggestBtnElement.forEach((e) => {
  e.addEventListener("click", getSuggestionAnswer);
});

// ChatBot response function - API call to open AI is made
async function getChatBotResponse(input) {
  loading = true;
  const query = `Please determine whether the following text is related to software technology or not: '${input}' If the text is related to software technology, please provide some information on the topic.`;
  const data = {
    model: "gpt-3.5-turbo-0301",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: query },
    ],
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
  };
  try {
    if (loading) {
      loadingElement.style.display = "block";
    }
    const response = await fetch(openAiUrl, dataObj);
    const res = await response.json();
    // console.log(res);
    console.log(res.choices[0].message);
    // console.log(res.choices[0].message.content);
    loading = false;
    loadingElement.style.display = "none";
    return `${res.choices[0].message.content}`;
  } catch (error) {
    console.log(error);
  }
}

// Debounce function
const debounceFunction = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// Event Listener for user input
userInputElement.addEventListener("input", (event) => {
  const searchTerm = event.target.value.trim();

  if (currentSearch) {
    currentSearch.abort();
  }

  const abortController = new AbortController();
  currentSearch = abortController;

  const debouncedSearch = debounceFunction(async (term, signal) => {
    try {
      const results = await getSuggestionList(term, signal);
      // console.log(results);
      showSuggestion(results);
    } catch (error) {
      console.error(error);
    }
  }, debounceTime);

  debouncedSearch(searchTerm, abortController.signal);
});
