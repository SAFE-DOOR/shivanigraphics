import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, app } from '../firebase';

const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage at the specified path and returns the download URL.
 */
export async function uploadProductImage(file: File, pathPrefix: string = 'products'): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const filePath = `${pathPrefix}/${timestamp}_${safeName}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Deletes a file directly from Firebase Storage using its download URL.
 */
export async function deleteProductImage(fileURL: string): Promise<void> {
  try {
    // Extract storage reference from download URL if possible or use ref(storage, fileURL)
    const storageRef = ref(storage, fileURL);
    await deleteObject(storageRef);
  } catch (e) {
    console.error('Error deleting file from Firebase Storage:', e);
  }
}

/**
 * Replaces an old image in Firebase Storage with a new file and returns the new download URL.
 */
export async function replaceProductImage(oldURL: string, newFile: File, pathPrefix: string = 'products'): Promise<string> {
  if (oldURL) {
    await deleteProductImage(oldURL);
  }
  return await uploadProductImage(newFile, pathPrefix);
}

/**
 * Updates the images array in a Firestore document.
 */
export async function updateFirestoreImageArray(docId: string, collectionName: string, newArray: string[]): Promise<void> {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, { images: newArray });
}
