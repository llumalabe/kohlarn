const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if configured
const isConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isConfigured()) {
  console.log('✅ Cloudinary configured successfully');
  console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.warn('⚠️  Cloudinary not configured. Please set environment variables:');
  console.warn('   CLOUDINARY_CLOUD_NAME');
  console.warn('   CLOUDINARY_API_KEY');
  console.warn('   CLOUDINARY_API_SECRET');
}

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} filename - Original filename
 * @param {string} hotelId - Hotel ID
 * @param {string} hotelName - Hotel name
 * @returns {Promise<{url: string, secure_url: string, public_id: string}>}
 */
async function uploadImage(fileBuffer, filename, hotelId, hotelName) {
  if (!isConfigured()) {
    throw new Error('Cloudinary not configured. Please set environment variables.');
  }

  try {
    // Convert buffer to base64
    const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

    // Upload options
    const options = {
      folder: `kohlarn/hotels/${hotelId}`, // จัดเก็บแบบมีโครงสร้าง
      public_id: `${hotelId}-${Date.now()}`, // ชื่อไฟล์ไม่ซ้ำ
      resource_type: 'image',
      overwrite: false,
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' }, // จำกัดขนาดสูงสุด
        { quality: 'auto:good' }, // คุณภาพอัตโนมัติ
        { fetch_format: 'auto' } // Format ที่เหมาะสม (WebP สำหรับ browser ที่รองรับ)
      ],
      tags: ['hotel', hotelId, hotelName.substring(0, 50)] // Tags สำหรับจัดการ
    };

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, options);

    console.log(`✅ Uploaded image to Cloudinary: ${result.secure_url}`);

    return {
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>}
 */
async function deleteImage(publicId) {
  if (!isConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

/**
 * Get image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Cloudinary transformation options
 * @returns {string}
 */
function getImageUrl(publicId, transformations = {}) {
  if (!isConfigured()) {
    return null;
  }

  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
}

/**
 * Get thumbnail URL
 * @param {string} publicId - Public ID of the image
 * @param {number} width - Thumbnail width
 * @param {number} height - Thumbnail height
 * @returns {string}
 */
function getThumbnailUrl(publicId, width = 300, height = 200) {
  return getImageUrl(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good'
  });
}

/**
 * List images in a folder
 * @param {string} hotelId - Hotel ID
 * @returns {Promise<Array>}
 */
async function listHotelImages(hotelId) {
  if (!isConfigured()) {
    return [];
  }

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: `kohlarn/hotels/${hotelId}`,
      max_results: 500
    });

    return result.resources;
  } catch (error) {
    console.error('Error listing images:', error);
    return [];
  }
}

module.exports = {
  uploadImage,
  deleteImage,
  getImageUrl,
  getThumbnailUrl,
  listHotelImages,
  isConfigured
};
