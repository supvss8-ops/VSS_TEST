import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import { User } from './types';
import { INITIAL_USERS } from './constants';
import { useState, useEffect } from 'react';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- Auth ---
export const loginWithUsernameAndPassword = async (name: string, password_provided: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;

    // In a real app, passwords should be hashed. Here we do a simple check.
    if (user.password === password_provided) {
      // Don't send password to the client-side state
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }

    return null;
  } catch (error) {
    console.error("Error logging in: ", error);
    throw new Error('An error occurred during login.');
  }
};


// --- Firestore Hook ---
export function useCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: any[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setData(items as T[]);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching collection ${collectionName}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading };
}

// --- Generic Firestore Functions ---
export const addDocument = async <T>(collectionName: string, data: T) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data as any);
    return docRef.id;
  } catch (e) {
    console.error(`Error adding document to ${collectionName}: `, e);
    throw e;
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  } catch (e) {
    console.error(`Error updating document in ${collectionName}: `, e);
    throw e;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (e) {
    console.error(`Error deleting document from ${collectionName}: `, e);
    throw e;
  }
};


// --- Initialization ---
export const initializeUsersIfEmpty = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    if (snapshot.empty) {
      console.log('Users collection is empty, initializing with default users...');
      const batch = writeBatch(db);
      INITIAL_USERS.forEach(user => {
        const newUserRef = doc(collection(db, 'users'));
        batch.set(newUserRef, user);
      });
      await batch.commit();
      console.log('Default users have been added.');
    }
  } catch (error) {
    console.error("Error initializing users: ", error);
  }
};
