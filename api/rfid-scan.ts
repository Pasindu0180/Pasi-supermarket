import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }

  return admin;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Test from browser
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "Pasi Supermarket RFID API online",
    });
  }

  // ESP32 sends POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  // Check secret RFID API key
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== process.env.RFID_API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "RFID UID is required",
      });
    }

    const firebase = getFirebaseAdmin();
    const db = firebase.firestore();

    await db.collection("rfidScans").add({
      uid: String(uid),
      scannedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      message: "RFID scan received",
      uid,
    });
  } catch (error) {
    console.error("RFID API error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}