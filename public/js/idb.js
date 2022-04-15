// variable to hold db connection
let db;

// establish a connection to IndexedDB database called 'budget_tracker' and set to version 1
const request = indexedDB.open('budget', 1);

// event to emit if db version changes (v1 to v2)
request.onupgradeneeded = function (e) {

  // saves a reference to the db
  const db = e.target.result;

  // creates an object store (table) called "new_transaction" auto incremented primary key
  db.createObjectStore('pending', {
    autoIncrement: true
  });
};

// upon success
request.onsuccess = function (e) {
  // when db is successfully create, save refernce to b in global variable
  db = e.target.result;

  // check if app is online, if so, run uploadTransaction(). This will send all local data to api
  if (navigator.online) {
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log(e.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction.objectStore('pending');
  const store = transaction.objectStore('pending');
  const getAll = store.getAll();


  // This function executes if attempt to submit new transaction with no internet connecti
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite');
          const store = transaction.objectStore('pending');
          store.clear();
        })
        .catch(err => {
          console.log(err);

        });
    }
  }
};


// listening for app to come back online
window.addEventListener('online', checkDatabase);