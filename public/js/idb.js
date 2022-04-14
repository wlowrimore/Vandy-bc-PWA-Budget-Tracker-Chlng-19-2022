let db;

const request = indexedDb.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {

  db = event.target.result;

  if (navigator.onLine) {

    // uploadIndex();
  }
};

request.onerror = function(event) {

  console.log(event.target.errorCode);
};