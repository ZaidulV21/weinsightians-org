// ==========================================
// CLOUDINARY CONFIGURATION
// ==========================================
// Reads credentials from environment variables, which config/loadEnv.js has already
// populated. On Render they come from the service's Environment settings. Values
// are never logged and never leave the server.

import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

export const BLOG_IMAGE_FOLDER = 'weinsightians_blogs';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

export const isCloudinaryConfigured = () =>
  Boolean(cloudName && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

// Streams a buffered image to Cloudinary. Nothing is written to disk first, so
// this behaves identically on Render and locally.
export const uploadBlogImage = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: BLOG_IMAGE_FOLDER,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// Extracts the public id from a Cloudinary URL, but only for images this project
// uploaded to its own folder and its own cloud. Anything unrecognised returns
// null, which makes cleanup a no-op rather than a guess.
const extractPublicId = (url) => {
  if (typeof url !== 'string' || !cloudName) return null;
  if (!url.startsWith(`https://res.cloudinary.com/${cloudName}/`)) return null;

  const marker = '/image/upload/';
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;

  const withoutQuery = url.slice(markerIndex + marker.length).split(/[?#]/)[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  // Cloudinary puts transformation segments and then a version segment in front
  // of the public id: .../upload/w_600,f_auto/v1699999999/folder/file.jpg
  const versionIndex = segments.findIndex((segment) => /^v\d{9,}$/.test(segment));
  const publicIdSegments = versionIndex === -1 ? segments : segments.slice(versionIndex + 1);

  const publicId = publicIdSegments.join('/');
  if (!publicId.startsWith(`${BLOG_IMAGE_FOLDER}/`)) return null;

  // The extension is not part of the public id.
  return publicId.replace(/\.[a-z0-9]+$/i, '');
};

// Best-effort removal of an image this project owns. Used when a post is deleted.
// Never throws and never blocks the request: a post must be deletable even if
// Cloudinary is unreachable.
export const destroyBlogImage = async (url) => {
  const publicId = extractPublicId(url);
  if (!publicId || !isCloudinaryConfigured()) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return result?.result === 'ok' || result?.result === 'not found';
  } catch (error) {
    console.error('⚠️  Cloudinary cleanup failed:', error?.message || 'unknown error');
    return false;
  }
};

export default cloudinary;
