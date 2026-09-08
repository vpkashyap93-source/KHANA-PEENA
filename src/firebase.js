import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'

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
let auth = null
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
}

// Login is backed by Firebase Authentication (email/password) so that
// "forgot password" can send a real reset email - there is no backend of
// our own to send mail from. Requires the Email/Password sign-in provider
// to be turned on in Firebase Console -> Authentication -> Sign-in method.
export const watchAuthState = (callback) => {
  if (!auth) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password)

export const logIn = (email, password) => signInWithEmailAndPassword(auth, email, password)

export const logOut = () => signOut(auth)

export const resetPassword = (email) => sendPasswordResetEmail(auth, email)

export const changeUserPassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser
  if (!user) throw new Error('Not logged in')
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword))
  await updatePassword(user, newPassword)
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

// --- Licensing: one document per Firebase Auth user, tracks trial/paid status ---

export const TRIAL_DAYS = 14
const LICENSE_CACHE_KEY = 'basil-license-cache'

const cacheLicense = (uid, license) => {
  try { localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ uid, license })) } catch { /* ignore */ }
}

export const getCachedLicense = (uid) => {
  try {
    const cached = JSON.parse(localStorage.getItem(LICENSE_CACHE_KEY))
    return cached && cached.uid === uid ? cached.license : null
  } catch {
    return null
  }
}

// Creates a fresh trial license the first time a user is seen, otherwise returns their existing one.
export const ensureLicense = async (uid, email) => {
  if (!db) return null
  const ref = doc(db, 'licenses', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const license = snap.data()
    cacheLicense(uid, license)
    return license
  }
  const trialExpiresAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const license = { email: email || '', restaurantName: '', ownerName: '', mobile: '', registeredAt: new Date().toISOString(), trialExpiresAt, status: 'trial' }
  await setDoc(ref, license)
  cacheLicense(uid, license)
  return license
}

// Best-effort - keeps the admin dashboard's restaurant name/owner/mobile columns filled in.
export const updateLicenseProfile = async (uid, { restaurantName, ownerName, mobile }) => {
  if (!db) return
  try { await setDoc(doc(db, 'licenses', uid), { restaurantName: restaurantName || '', ownerName: ownerName || '', mobile: mobile || '' }, { merge: true }) } catch { /* ignore */ }
}

export const listLicenses = async () => {
  if (!db) return []
  const snap = await getDocs(collection(db, 'licenses'))
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export const setLicenseStatus = async (uid, status) => {
  if (!db) return
  await setDoc(doc(db, 'licenses', uid), { status }, { merge: true })
}

// Adds `days` to whichever is later - the current trial expiry or today - and puts the license back on trial.
export const extendLicense = async (uid, days) => {
  if (!db) return
  const snap = await getDoc(doc(db, 'licenses', uid))
  const current = snap.exists() ? snap.data() : null
  const currentExpiry = current?.trialExpiresAt ? new Date(current.trialExpiresAt) : new Date()
  const base = currentExpiry > new Date() ? currentExpiry : new Date()
  base.setDate(base.getDate() + Number(days))
  await setDoc(doc(db, 'licenses', uid), { trialExpiresAt: base.toISOString(), status: 'trial' }, { merge: true })
}

export const isLicenseLocked = (license) => {
  if (!license) return false
  if (license.status === 'suspended') return true
  if (license.status === 'active') return false
  if (license.status === 'trial') return new Date(license.trialExpiresAt) < new Date()
  return false
}
