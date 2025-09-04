export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG
  format?: 'jpeg' | 'png' | 'webp';
}

export async function compressImage(
  file: File | Blob,
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 800,     
    maxHeight = 600,    
    quality = 0.8,      
    format = 'jpeg'     
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    img.onload = () => {
      const { width: originalWidth, height: originalHeight } = img;
      
      // Calculate the scaling factors for both dimensions
      const widthScale = maxWidth / originalWidth;
      const heightScale = maxHeight / originalHeight;
      
      // Choose the smaller scale factor to ensure we stay within both limits
      const scale = Math.min(widthScale, heightScale);
      
      // Only scale down, never up
      const finalScale = Math.min(scale, 1);
      
      // Calculate final dimensions
      const finalWidth = Math.round(originalWidth * finalScale);
      const finalHeight = Math.round(originalHeight * finalScale);

      // Set canvas size to final dimensions
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      // Draw scaled image
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Compression failed'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function compressImageFromUrl(
  url: string,
  options: ImageCompressionOptions = {}
): Promise<Blob> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await compressImage(blob, options);
  } catch (error) {
    throw new Error(`Failed to fetch and compress image: ${error}`);
  }
}

export function getImageSizeCategory(sizeInBytes: number): string {
  const kb = sizeInBytes / 1024;
  if (kb < 100) return 'optimal';
  if (kb < 500) return 'good';
  if (kb < 1000) return 'large';
  return 'too-large';
}

// Helper function to calculate what the final dimensions will be
export function calculateFinalDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number = 800, 
  maxHeight: number = 600
): { width: number; height: number; scale: number } {
  const widthScale = maxWidth / originalWidth;
  const heightScale = maxHeight / originalHeight;
  const scale = Math.min(widthScale, heightScale, 1); // Never scale up
  
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
    scale
  };
}