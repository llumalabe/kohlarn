const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const stream = require('stream');

// Load Service Account
let drive;
let canWrite = false;

try {
  let serviceAccount;
  
  // Priority 1: Environment variable (base64 encoded) - for Vercel
  if (process.env.SERVICE_ACCOUNT_BASE64) {
    const base64 = process.env.SERVICE_ACCOUNT_BASE64;
    const json = Buffer.from(base64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(json);
  }
  // Priority 2: Environment variable (JSON string)
  else if (process.env.SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
  }
  // Priority 3: Local file - for development
  else {
    const serviceAccountPath = path.join(__dirname, '../service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
  }
  
  if (serviceAccount) {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
      ],
    });
    
    drive = google.drive({ version: 'v3', auth });
    canWrite = true;
    console.log('✅ Google Drive initialized with Service Account');
  } else {
    console.error('❌ No Service Account found for Google Drive');
  }
} catch (error) {
  console.error('❌ Error initializing Google Drive:', error.message);
}

// Google Drive Folder ID for hotel images (will be created if not exists)
let HOTEL_IMAGES_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

/**
 * Get or create the main folder for hotel images
 */
async function getOrCreateMainFolder() {
  if (HOTEL_IMAGES_FOLDER_ID) {
    return HOTEL_IMAGES_FOLDER_ID;
  }

  try {
    const folderName = 'Kohlarn Hotel Images';
    
    // Search for existing folder
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files.length > 0) {
      HOTEL_IMAGES_FOLDER_ID = response.data.files[0].id;
      console.log(`✅ Found existing folder: ${folderName} (${HOTEL_IMAGES_FOLDER_ID})`);
    } else {
      // Create new folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };
      
      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });
      
      HOTEL_IMAGES_FOLDER_ID = folder.data.id;
      console.log(`✅ Created new folder: ${folderName} (${HOTEL_IMAGES_FOLDER_ID})`);
    }

    return HOTEL_IMAGES_FOLDER_ID;
  } catch (error) {
    console.error('Error getting/creating main folder:', error);
    throw error;
  }
}

/**
 * Get or create a folder for a specific hotel
 */
async function getOrCreateHotelFolder(hotelId, hotelName) {
  if (!canWrite) {
    throw new Error('Google Drive not initialized');
  }

  try {
    const mainFolderId = await getOrCreateMainFolder();
    const folderName = `${hotelId} - ${hotelName}`;

    // Search for existing hotel folder
    const response = await drive.files.list({
      q: `name='${folderName}' and '${mainFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create new hotel folder
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [mainFolderId]
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id'
    });

    console.log(`✅ Created folder for hotel: ${folderName}`);
    return folder.data.id;
  } catch (error) {
    console.error('Error getting/creating hotel folder:', error);
    throw error;
  }
}

/**
 * Upload image to Google Drive
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - File MIME type
 * @param {string} hotelId - Hotel ID
 * @param {string} hotelName - Hotel name
 * @returns {Promise<{fileId: string, webViewLink: string, webContentLink: string}>}
 */
async function uploadImage(fileBuffer, filename, mimeType, hotelId, hotelName) {
  if (!canWrite) {
    throw new Error('Google Drive not initialized with write access');
  }

  try {
    // Get or create hotel folder
    const hotelFolderId = await getOrCreateHotelFolder(hotelId, hotelName);

    // Create a readable stream from buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const uniqueFilename = `hotel-${hotelId}-${timestamp}${ext}`;

    // Upload file
    const fileMetadata = {
      name: uniqueFilename,
      parents: [hotelFolderId]
    };

    const media = {
      mimeType: mimeType,
      body: bufferStream
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Get direct download link
    const directLink = `https://drive.google.com/uc?export=view&id=${file.data.id}`;

    console.log(`✅ Uploaded image: ${uniqueFilename} to hotel folder ${hotelId}`);

    return {
      fileId: file.data.id,
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink,
      directLink: directLink
    };
  } catch (error) {
    console.error('Error uploading image to Google Drive:', error);
    throw error;
  }
}

/**
 * Delete old images from hotel folder
 * @param {string} hotelId - Hotel ID
 * @param {string} hotelName - Hotel name
 * @param {string[]} keepFileIds - Array of file IDs to keep (don't delete)
 */
async function deleteOldImages(hotelId, hotelName, keepFileIds = []) {
  if (!canWrite) {
    throw new Error('Google Drive not initialized with write access');
  }

  try {
    const hotelFolderId = await getOrCreateHotelFolder(hotelId, hotelName);

    // List all files in hotel folder
    const response = await drive.files.list({
      q: `'${hotelFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    const filesToDelete = response.data.files.filter(file => !keepFileIds.includes(file.id));

    // Delete old files
    for (const file of filesToDelete) {
      await drive.files.delete({
        fileId: file.id
      });
      console.log(`🗑️ Deleted old image: ${file.name}`);
    }

    if (filesToDelete.length > 0) {
      console.log(`✅ Deleted ${filesToDelete.length} old image(s) from hotel ${hotelId}`);
    }
  } catch (error) {
    console.error('Error deleting old images:', error);
    // Don't throw error, just log it
  }
}

/**
 * Delete a specific file
 * @param {string} fileId - Google Drive file ID
 */
async function deleteFile(fileId) {
  if (!canWrite) {
    throw new Error('Google Drive not initialized with write access');
  }

  try {
    await drive.files.delete({
      fileId: fileId
    });
    console.log(`✅ Deleted file: ${fileId}`);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Extract file ID from Google Drive URL
 * @param {string} url - Google Drive URL
 * @returns {string|null} - File ID or null
 */
function extractFileIdFromUrl(url) {
  if (!url) return null;

  // Match various Google Drive URL formats
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

module.exports = {
  uploadImage,
  deleteOldImages,
  deleteFile,
  extractFileIdFromUrl,
  getOrCreateMainFolder,
  getOrCreateHotelFolder,
  canWrite
};
