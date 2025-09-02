// Audio utility functions for handling audio files in the application

export interface AudioValidationOptions {
  maxSizeBytes?: number; // Default: 10MB
  allowedMimeTypes?: string[];
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'audio/mpeg',     // .mp3
  'audio/wav',      // .wav
  'audio/mp4',      // .m4a
  'audio/ogg',      // .ogg
  'audio/webm',     // .webm
  'audio/aac',      // .aac
];

export function validateAudioFile(file: File, options: AudioValidationOptions = {}): string | null {
  const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;
  const allowedTypes = options.allowedMimeTypes ?? DEFAULT_ALLOWED_TYPES;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return `Audio file must be smaller than ${maxSizeMB}MB`;
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return `Audio format not supported. Please use: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`;
  }

  return null; // Valid
}

export function formatAudioDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata'));
    };
    
    audio.src = url;
  });
}

export async function fetchAudioAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType?.startsWith('audio/')) {
    throw new Error('URL does not point to an audio file');
  }
  
  return await response.blob();
}