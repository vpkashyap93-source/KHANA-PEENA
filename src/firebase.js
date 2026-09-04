import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

// Paste your Firebase project's config here (Firebase console -> Project settings -> Your apps -> Web app -> SDK setup).
// This config is safe to keep in the frontend code - it is not a secret key.
const firebaseConfig = {
  apiKey: 'AIzaSyCMVGfxpbxJJW2y3imKjRp6adhtR69DfkQ',
  authDomain: 'resturent-order.firebaseapp.com',
  projectId: 'resturent-order',
  storageBucket: 'resturent-order.firebasestorage.app',
  messagingSenderId: '801428487693',
  appId: '1:801428487693:web:9191d342b050119f845f44',
}

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('PASTE_')

let db = null
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
}

const BACKUP_PREFIX = 'basil-'

export const getRestaurantId = () => {
  let id = localStorage.getItem('basil-restaurant-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('basil-restaurant-id', id)
  }
  return id
}

export const pushCloudBackup = async () => {
  if (!db) return { ok: false, reason: 'not-configured' }
  const backup = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(BACKUP_PREFIX)) backup[key] = localStorage.getItem(key)
  }
  try {
    await setDoc(doc(db, 'backups', getRestaurantId()), { data: backup, updatedAt: new Date().toISOString() })
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}

export const pullCloudBackup = async () => {
  if (!db) return { ok: false, reason: 'not-configured' }
  try {
    const snap = await getDoc(doc(db, 'backups', getRestaurantId()))
    if (!snap.exists()) return { ok: false, reason: 'no-backup-found' }
    const { data, updatedAt } = snap.data()
    Object.entries(data).forEach(([key, value]) => { if (key.startsWith(BACKUP_PREFIX)) localStorage.setItem(key, value) })
    return { ok: true, updatedAt }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}
