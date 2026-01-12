// Screenshot Capture Utility
// Handles capturing and compressing screenshots

/**
 * Capture a screenshot of the visible viewport
 * @returns {Promise<string>} Base64 encoded image data URL
 */
export async function captureScreenshot() {
  try {
    // Use chrome.tabs.captureVisibleTab to capture screenshot
    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png',
      quality: 90,
    });

    // Compress the image
    const compressed = await compressImage(dataUrl);
    return compressed;
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    return null;
  }
}

/**
 * Compress an image data URL
 * @param {string} dataUrl - Original image data URL
 * @returns {Promise<string>} Compressed image data URL
 */
async function compressImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Create canvas with reduced dimensions
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxWidth;
          height = width / aspectRatio;
        } else {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG for better compression
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressed);
    };

    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Crop screenshot to show a specific element
 * @param {string} dataUrl - Screenshot data URL
 * @param {DOMRect} rect - Element bounding rect
 * @param {number} padding - Padding around element
 * @returns {Promise<string>} Cropped image data URL
 */
export async function cropToElement(dataUrl, rect, padding = 20) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate crop area with padding
      const x = Math.max(0, rect.left - padding);
      const y = Math.max(0, rect.top - padding);
      const width = Math.min(img.width - x, rect.width + padding * 2);
      const height = Math.min(img.height - y, rect.height + padding * 2);

      canvas.width = width;
      canvas.height = height;

      // Draw cropped area
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

      // Convert to JPEG
      const cropped = canvas.toDataURL('image/jpeg', 0.7);
      resolve(cropped);
    };

    img.onerror = reject;
    img.src = dataUrl;
  });
}
