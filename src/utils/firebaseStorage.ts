import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { storage } from '../firebase';

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
    if (!fileURL || !fileURL.includes('firebasestorage.googleapis.com')) {
      return;
    }
    const storageRef = ref(storage, fileURL);
    await deleteObject(storageRef);
  } catch (e) {
    console.error('Error deleting file from Firebase Storage:', e);
  }
}
