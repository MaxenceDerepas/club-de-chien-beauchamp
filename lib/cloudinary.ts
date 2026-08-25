import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
    url: string;
    publicId: string;
};

/**
 * Upload an image buffer to Cloudinary.
 * @param buffer - The image file buffer
 * @param folder - The Cloudinary folder (e.g. "members", "gallery")
 * @returns The secure URL and public_id
 */
export async function uploadImage(
    buffer: Buffer,
    folder: string,
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: `club-canin/${folder}`,
                resource_type: "image",
                transformation: [
                    { quality: "auto", fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error("Upload failed"));
                    return;
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            },
        );
        stream.end(buffer);
    });
}

/**
 * Delete an image from Cloudinary by its public_id.
 */
export async function deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error("Cloudinary delete error:", err);
    }
}

/**
 * Extract the public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/xxx/image/upload/v123/club-canin/members/abc.jpg
 * Returns: club-canin/members/abc
 */
export function extractPublicId(url: string): string {
    if (!url || !url.includes("cloudinary.com")) return "";
    const parts = url.split("/upload/");
    if (parts.length < 2) return "";
    // Remove version prefix (v1234567890/) and file extension
    const afterUpload = parts[1].replace(/^v\d+\//, "");
    return afterUpload.replace(/\.[^.]+$/, "");
}

export { cloudinary };
