function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json()
}

export default function fetchJson(url) {
  return fetch(url)
    .then(checkStatus)
    .then(parseJSON);
}
