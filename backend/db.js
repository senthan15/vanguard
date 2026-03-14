const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db;
let usingFirebase = false;

// Local JSON DB as fallback
const LOCAL_DB_PATH = path.join(__dirname, 'database.json');
let localData = { invoices: {} };

try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
        localData = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
    }
} catch (e) { console.log("Initializing new local DB"); }

function saveLocal() {
    try {
        fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localData, null, 2));
    } catch (e) {
        console.error("Failed to save local DB:", e);
    }
}

// Try Initialize Firebase
try {
    // Check for serviceAccountKey.json or env vars
    // User can place service-account.json in backend/ root
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'service-account.json');

    if (process.env.FIREBASE_CONFIG) {
        // Initialize from Env Var if available
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CONFIG))
        });
        db = admin.firestore();
        usingFirebase = true;
        console.log("🔥 Firebase Firestore Initialized (Env)");
    } else if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        usingFirebase = true;
        console.log("🔥 Firebase Firestore Initialized (File)");
    } else {
        console.log("⚠️ Firebase Credential not found (service-account.json). Using local JSON DB.");
    }
} catch (error) {
    console.log("⚠️ Firebase Initialization failed:", error.message);
    console.log("Using local JSON DB.");
}

// API Wrapper
async function saveInvoice(invoice) {
    // Ensure invoice has a tokenId
    if (!invoice.tokenId) throw new Error("tokenId required for saving invoice");

    if (usingFirebase) {
        await db.collection('invoices').doc(invoice.tokenId).set(invoice);
    } else {
        localData.invoices[invoice.tokenId] = invoice;
        saveLocal();
    }
    return invoice;
}

async function getInvoice(tokenId) {
    if (usingFirebase) {
        const doc = await db.collection('invoices').doc(tokenId).get();
        return doc.exists ? doc.data() : null;
    } else {
        return localData.invoices[tokenId] || null;
    }
}

async function getAllInvoices() {
    if (usingFirebase) {
        const snapshot = await db.collection('invoices').get();
        return snapshot.docs.map(doc => doc.data());
    } else {
        return Object.values(localData.invoices);
    }
}

async function updateInvoiceStatus(tokenId, status) {
    if (usingFirebase) {
        await db.collection('invoices').doc(tokenId).update({ status });
    } else {
        if (localData.invoices[tokenId]) {
            localData.invoices[tokenId].status = status;
            saveLocal();
        }
    }
}

module.exports = { saveInvoice, getInvoice, getAllInvoices, updateInvoiceStatus, usingFirebase };
