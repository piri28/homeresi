import admin from 'firebase-admin';

// Initialize Firebase Admin
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
    // Fetch all building IDs
    const snapshot = await db.collection('buildings').get();
    const buildings = snapshot.docs.map(doc => ({ id: doc.id }));

    // Construct the XML sitemap
    // .trim() is used here to ensure no leading/trailing whitespace exists
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://homeresi.com/</loc></url>
  ${buildings.map(building => `
  <url><loc>https://homeresi.com/building/${building.id}</loc></url>
  `).join('')}
</urlset>`.trim();

    // Crucial: Set content type to application/xml for Google Search Console
    res.setHeader('Content-Type', 'application/xml');
    
    // Send the response
    res.status(200).send(sitemap);

  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
