// variable to hold db connection
let db;

// establish a connection to IndexedDB databes called 'budget_tracker' and set to version 1
const request = indexedDb.open('budget_tracker', 1);

// event to emit if db version changes (v1 to v2)
request.onupgradeneeded = function (event) {

  // saves a reference to the db
  const db = event.target.result;

  // creates an object store (table) called "new_transaction" auto incremented primary key
  db.createObjectStore('new_transaction', {
    autoIncrement: true
  });
};

// upon success
request.onsuccess = function (event) {
  // when db is successfully create, save refernce to b in global variable
  db = event.target.result;

  // check if app is online, if so, run uploadTransaction(). This will send all local data to api
  if (navigator.online) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {

  const transaction = db.transaction(['new_transaction'], readwrite);

  constbudgetObjectStore = transaction.ObjectStore = transaction.objectStore('new_transaction');

  budgetObjectStore.add(record);
}

// This function executes if attempt to submit new transaction with no internet connection
function uploadTransaction() {

  const transaction = db.transaction(['new_transaction'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_transaction');

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_transaction'], 'readwrite');

          const budgetObjectStore = transaction.objectStore('new_transaction');

          budgetObjectStore.clear();

          alert('All saved transactions have been submittedd!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
}