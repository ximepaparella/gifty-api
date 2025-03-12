import { v2 as cloudinary } from 'cloudinary';
import logger from '@shared/infrastructure/logging/logger';

// Define types for Cloudinary responses
interface UploadApiResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  folder: string;
}

interface DeleteApiResponse {
  result: string;
}

// Define types for image presets
interface ImageTransformation {
  width: number;
  height: number;
  crop: string;
}

interface ImagePresets {
  [key: string]: ImageTransformation;
}

// Image size presets for different use cases
const IMAGE_PRESETS: ImagePresets = {
  thumbnail: { width: 150, height: 150, crop: 'fill' },
  medium: { width: 800, height: 600, crop: 'fill' },
  large: { width: 1920, height: 1080, crop: 'fill' }
};

// Allowed image formats
const ALLOWED_FORMATS: string[] = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE: number = 10 * 1024 * 1024; // 10MB

/**
 * Initialize Cloudinary with credentials from environment variables
 */
export const initCloudinary = (): void => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      logger.warn('Cloudinary credentials not found in environment variables. Image upload functionality will not work.');
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    logger.info('Cloudinary initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Cloudinary:', error);
  }
};

/**
 * Upload an image to Cloudinary
 * @param imageBuffer - The image buffer to upload
 * @param folder - The folder to upload to
 * @returns The Cloudinary upload result
 */
export const uploadImage = async (
  imageBuffer: Buffer,
  folder = 'gifty'
): Promise<UploadApiResponse> => {
  try {
    // Convert buffer to base64 string
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'image'
    });

    return result as unknown as UploadApiResponse;
  } catch (error) {
    logger.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns The Cloudinary deletion result
 */
export const deleteImage = async (
  publicId: string
): Promise<DeleteApiResponse> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result as unknown as DeleteApiResponse;
  } catch (error) {
    logger.error(`Error deleting image with ID ${publicId} from Cloudinary:`, error);
    throw error;
  }
};

const generateImageUrl = (publicId: string, preset: string = 'medium'): string => {
  const transformations = IMAGE_PRESETS[preset];
  return cloudinary.url(publicId, {
    ...transformations,
    fetch_format: 'auto',
    quality: 'auto'
  });
};

export default cloudinary;

export {
  generateImageUrl,
  IMAGE_PRESETS,
  ALLOWED_FORMATS,
  MAX_FILE_SIZE
}; 