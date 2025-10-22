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
    console.log('📧 Service Account Email:', serviceAccount.client_email);
    console.log('⚠️  To use Google Drive, you must:');
    console.log('   1. Create a folder in YOUR Google Drive');
    console.log('   2. Right-click → Share');
    console.log('   3. Add this email:', serviceAccount.client_email);
    console.log('   4. Give "Editor" permission');
    console.log('   5. Copy the folder ID from URL and set GOOGLE_DRIVE_FOLDER_ID in .env');
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
  if (!HOTEL_IMAGES_FOLDER_ID) {
    throw new Error(
      '❌ GOOGLE_DRIVE_FOLDER_ID not configured!\n\n' +
      'To fix this:\n' +
      '1. Create a folder in YOUR Google Drive (not Service Account)\n' +
      '2. Right-click the folder → Share\n' +
      '3. Add this email with Editor permission: ' + (drive.context._options.auth.credentials?.client_email || 'SERVICE_ACCOUNT_EMAIL') + '\n' +
      '4. Copy the folder ID from URL (e.g., https://drive.google.com/drive/folders/FOLDER_ID_HERE)\n' +
      '5. Add to .env: GOOGLE_DRIVE_FOLDER_ID=your_folder_id\n' +
      '6. Restart the server\n\n' +
      'Service Accounts cannot create folders in their own space due to no storage quota.'
    );
  }

  // Verify folder exists and is accessible
  try {
    const folder = await drive.files.get({
      fileId: HOTEL_IMAGES_FOLDER_ID,
      fields: 'id, name, capabilities',
      supportsAllDrives: true
    });
    
    console.log(`✅ Using shared folder: ${folder.data.name} (${HOTEL_IMAGES_FOLDER_ID})`);
    return HOTEL_IMAGES_FOLDER_ID;
  } catch (error) {
    throw new Error(
      `❌ Cannot access folder ${HOTEL_IMAGES_FOLDER_ID}\n\n` +
      'Please make sure:\n' +
      '1. The folder exists in YOUR Google Drive\n' +
      '2. You have shared it with: ' + (drive.context._options.auth.credentials?.client_email || 'SERVICE_ACCOUNT_EMAIL') + '\n' +
      '3. The Service Account has Editor permission\n' +
      '4. The folder ID in .env is correct\n\n' +
      'Error: ' + error.message
    );
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
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
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
      fields: 'id',
      supportsAllDrives: true
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
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      },
      supportsAllDrives: true
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
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    const filesToDelete = response.data.files.filter(file => !keepFileIds.includes(file.id));

    // Delete old files
    for (const file of filesToDelete) {
      await drive.files.delete({
        fileId: file.id,
        supportsAllDrives: true
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
      fileId: fileId,
      supportsAllDrives: true
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
