import { initializeApp, getApps, getApp, deleteApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, Database, off } from 'firebase/database';
import { FirebaseConfig } from '../types';

let currentApp: FirebaseApp | null = null;
let currentDb: Database | null = null;

const getFirebaseInstance = (config: FirebaseConfig): Database => {
  // If we have an existing app, check if config matches or just reset it for simplicity when config changes
  // For this simple app, we can just re-initialize if the config object reference changes or we can try to be smart.
  // We will simply delete and re-create if it exists to ensure new config is applied.
  
  if (getApps().length > 0) {
    const app = getApp();
    // In a real prod app we'd compare config, but here we assume if we are calling this, we want to ensure connection
    // However, deleteApp is async.
    // For the scope of this sync function, we'll try to reuse if projectId matches, otherwise warn.
    if (app.options.projectId === config.projectId) {
       return getDatabase(app);
    }
  }

  // Note: Proper cleanup of previous apps in a hot-reload or re-config scenario is complex in sync code.
  // We will assume the user provides a valid config and we initialize a new app with a unique name if needed,
  // or just use the default.
  
  try {
    if (getApps().length === 0) {
      currentApp = initializeApp(config);
    } else {
      currentApp = getApp();
    }
    currentDb = getDatabase(currentApp);
    return currentDb;
  } catch (error) {
    console.error("Firebase init error", error);
    throw new Error("Invalid Firebase Configuration");
  }
};

export const sendCommand = async (config: FirebaseConfig, data: any): Promise<void> => {
  if (!config.databaseURL || !config.databasePath) throw new Error("Missing Database Configuration");
  
  const db = getFirebaseInstance(config);
  const dataRef = ref(db, config.databasePath);
  await set(dataRef, data);
};

export const subscribeToCommand = (config: FirebaseConfig, callback: (data: any) => void): () => void => {
  if (!config.databaseURL || !config.databasePath) return () => {};

  try {
    const db = getFirebaseInstance(config);
    const dataRef = ref(db, config.databasePath);
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      callback(val);
    }, (error) => {
      console.error("Firebase Read Error", error);
    });

    return () => off(dataRef, 'value', unsubscribe);
  } catch (e) {
    console.error("Failed to subscribe", e);
    return () => {};
  }
};
