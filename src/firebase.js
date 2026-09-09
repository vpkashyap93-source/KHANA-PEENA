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

// Confirms the current password without changing anything - used to gate destructive actions.
export const verifyPassword = async (password) => {
  const user = auth.currentUser
  if (!user) throw new Error('Not logged in')
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
}

const BACKUP_PREFIX = 'basil-'
const ACTIVE_UID_KEY = 'basil-active-data-uid'

// Data used to be keyed by a random per-browser id, which meant every account
// signed into the same browser shared one pile of localStorage data. Now the
// backup (and therefore "which account this browser's data belongs to") is
// keyed by the logged-in Firebase user's uid instead.
export const getRestaurantId = () => auth?.currentUser?.uid || null

export const pushCloudBackup = async () => {
  const uid = getRestaurantId()
  if (!db || !uid) return { ok: false, reason: 'not-configured' }
  const backup = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(BACKUP_PREFIX) && key !== ACTIVE_UID_KEY) backup[key] = localStorage.getItem(key)
  }
  try {
    await setDoc(doc(db, 'backups', uid), { data: backup, updatedAt: new Date().toISOString() })
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}

export const pullCloudBackup = async (uidOverride) => {
  const uid = uidOverride || getRestaurantId()
  if (!db || !uid) return { ok: false, reason: 'not-configured' }
  try {
    const snap = await getDoc(doc(db, 'backups', uid))
    if (!snap.exists()) return { ok: false, reason: 'no-backup-found' }
    const { data, updatedAt } = snap.data()
    Object.entries(data).forEach(([key, value]) => { if (key.startsWith(BACKUP_PREFIX) && key !== ACTIVE_UID_KEY) localStorage.setItem(key, value) })
    return { ok: true, updatedAt }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}

// Keeps different accounts from sharing localStorage data when the same
// browser/device is used to log into more than one Shahi Bhoj account: wipes
// this device's local restaurant data and pulls the newly logged-in
// account's own cloud backup (if any) before the app renders it.
export const syncAccountData = async (uid) => {
  const activeUid = localStorage.getItem(ACTIVE_UID_KEY)
  if (activeUid === uid) return { switched: false }
  if (!activeUid) {
    // First run on a device that predates per-account data - adopt whatever
    // is already here as this logged-in user's data instead of wiping it.
    localStorage.setItem(ACTIVE_UID_KEY, uid)
    return { switched: false }
  }
  // A different account was last active in this browser - isolate it: clear
  // that account's local data and pull the newly logged-in account's own.
  Object.keys(localStorage)
    .filter((key) => key.startsWith(BACKUP_PREFIX) && key !== ACTIVE_UID_KEY && key !== LICENSE_CACHE_KEY)
    .forEach((key) => localStorage.removeItem(key))
  await pullCloudBackup(uid)
  localStorage.setItem(ACTIVE_UID_KEY, uid)
  return { switched: true }
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

// Best-effort - keeps the admin dashboard's client-detail columns filled in.
export const updateLicenseProfile = async (uid, profile) => {
  if (!db) return
  const { restaurantName, ownerName, mobile, businessEmail, address, city, state, pincode, gstin } = profile
  try {
    await setDoc(doc(db, 'licenses', uid), {
      restaurantName: restaurantName || '',
      ownerName: ownerName || '',
      mobile: mobile || '',
      businessEmail: businessEmail || '',
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      gstin: gstin || '',
    }, { merge: true })
  } catch { /* ignore */ }
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

// Wipes this account's cloud backup so a device that logs into it later
// doesn't pull old data back down. Used by the Settings "Reset data" action.
export const wipeCloudBackup = async () => {
  const uid = getRestaurantId()
  if (!db || !uid) return { ok: false, reason: 'not-configured' }
  try {
    await setDoc(doc(db, 'backups', uid), { data: {}, updatedAt: new Date().toISOString() })
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: error.message }
  }
}

export const isLicenseLocked = (license) => {
  if (!license) return false
  if (license.status === 'suspended') return true
  if (license.status === 'active') return false
  if (license.status === 'trial') return new Date(license.trialExpiresAt) < new Date()
  return false
}
