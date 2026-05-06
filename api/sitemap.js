import admin from 'firebase-admin';

// Initialize Firebase Admin (Using your existing environment variables)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    // 1. Fetch all building IDs from Firebase
    const snapshot = await db.collection('buildings').get();
    
    // 2. Start building the XML structure
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://www.homeresi.com/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>`;

    // 3. Add each building URL to the sitemap
    snapshot.forEach((doc) => {
      const buildingId = doc.id; 
      // This matches your URL structure: homeresi.com/building/ID
      xml += `
      <url>
        <loc>https://www.homeresi.com/building/${buildingId}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
    });

    xml += `</urlset>`;

    // 4. Send the response as XML
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml.trim());

  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).send("Internal Server Error");
  }
}
