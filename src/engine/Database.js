export default class Database {
  constructor() {
    this.dbName = 'ChronoWinDB';
    this.dbVersion = 1;
    this.storeName = 'participants';
    this.db = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error("Erreur IndexedDB:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          objectStore.createIndex('score', 'score', { unique: false });
          objectStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  saveParticipant(data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error("Database not initialized"));
      }

      data.date = new Date().toISOString();
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  getAllParticipants() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error("Database not initialized"));
      }

      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  clearDatabase() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error("Database not initialized"));
      }

      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }
}
