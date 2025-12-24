import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IUploadProvider } from './upload.interface';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import mime from 'mime-types';
import axios from 'axios';
import 'multer';

export class SupabaseStorage implements IUploadProvider {
  private _client: SupabaseClient;
  private _bucketName: string;

  constructor(
    supabaseUrl: string,
    supabaseServiceRoleKey: string,
    bucketName: string
  ) {
    // Initialize Supabase client with service role key for admin access
    this._client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    this._bucketName = bucketName;
  }

  /**
   * Upload a file from a URL path
   * Used for downloading and re-uploading external images
   */
  async uploadSimple(path: string): Promise<string> {
    try {
      // Fetch the file from the URL
      const response = await axios.get(path, { responseType: 'arraybuffer' });
      const contentType =
        response?.headers?.['content-type'] ||
        response?.headers?.['Content-Type'] ||
        'application/octet-stream';

      // Get file extension from content type
      const extension = mime.extension(contentType) || 'bin';
      const id = makeId(10);
      const fileName = `${id}.${extension}`;

      // Upload to Supabase Storage
      const { data, error } = await this._client.storage
        .from(this._bucketName)
        .upload(fileName, Buffer.from(response.data), {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error('Error uploading file to Supabase Storage:', error);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this._client.storage.from(this._bucketName).getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Error in uploadSimple to Supabase Storage:', err);
      throw err;
    }
  }

  /**
   * Upload a file from Express Multer
   * Used for direct file uploads from the frontend
   */
  async uploadFile(file: Express.Multer.File): Promise<any> {
    try {
      const id = makeId(10);
      const extension = mime.extension(file.mimetype) || 'bin';
      const fileName = `${id}.${extension}`;

      // Upload to Supabase Storage
      const { data, error } = await this._client.storage
        .from(this._bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Error uploading file to Supabase Storage:', error);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this._client.storage.from(this._bucketName).getPublicUrl(fileName);

      // Return object matching the expected interface (similar to other providers)
      return {
        filename: fileName,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
        originalname: fileName,
        fieldname: 'file',
        path: publicUrl,
        destination: publicUrl,
        encoding: '7bit',
        stream: file.buffer as any,
      };
    } catch (err) {
      console.error('Error uploading file to Supabase Storage:', err);
      throw err;
    }
  }

  /**
   * Remove a file from Supabase Storage
   * @param filePath - Can be either full URL or just the filename
   */
  async removeFile(filePath: string): Promise<void> {
    try {
      // Extract filename from path (handle both URL and filename)
      let fileName = filePath;

      // If it's a full URL, extract the filename
      if (filePath.includes('/')) {
        fileName = filePath.split('/').pop() || filePath;
      }

      // Remove from Supabase Storage
      const { error } = await this._client.storage
        .from(this._bucketName)
        .remove([fileName]);

      if (error) {
        console.error('Error removing file from Supabase Storage:', error);
        // Don't throw error on delete - file might already be deleted
        // This matches the behavior of the Cloudflare provider
      }
    } catch (err) {
      console.error('Error in removeFile from Supabase Storage:', err);
      // Don't throw - gracefully handle missing files
    }
  }
}

export default SupabaseStorage;
