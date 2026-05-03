import admin from 'firebase-admin';

// Initialize Firebase Admin with environment variables for security
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  try {
    // Fetch all building records from the 'buildings' collection
    const snapshot = await db.collection('buildings').get();
    const buildings = snapshot.docs.map(doc => ({ id: doc.id }));

    // Construct the XML structure for the sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://homeresi.com/</loc>
  </url>
  ${buildings.map(building => `
  <url>
    <loc>https://homeresi.com/building/${building.id}</loc>
  </url>`).join('')}
</urlset>`;

    // Set the response header to XML and return the sitemap
    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap.trim());
    res.end();
  } catch (error) {
    console.error(error);
    // Return a generic error message in case of failure
    res.status(500).end("Internal Server Error");
  }
}
