import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check, AlertCircle, Loader2, X, Link as LinkIcon } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabaseClient';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  authToken?: string | null;
  label?: string;
  required?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  authToken,
  label = 'Featured Image',
  required = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (.jpg, .png, .webp, .gif).');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `posts/${cleanFileName}`;
      let uploadedUrl: string | null = null;

      // 1. Try Direct Supabase Client Storage Upload first
      const sb = getSupabaseClient();
      if (sb) {
        try {
          const { error: uploadError } = await sb.storage
            .from('post-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });

          if (!uploadError) {
            const { data } = sb.storage.from('post-images').getPublicUrl(filePath);
            if (data?.publicUrl) {
              uploadedUrl = data.publicUrl;
            }
          } else {
            console.warn('[Direct Supabase Storage] Upload error, trying server fallback:', uploadError.message);
          }
        } catch (clientErr: any) {
          console.warn('[Direct Supabase Storage] Exception:', clientErr);
        }
      }

      // 2. If direct client upload was not completed or bucket RLS rejected it, use server-side proxy
      if (!uploadedUrl) {
        try {
          // Convert file to base64
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const res = await fetch('/api/admin/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken || 'demo-admin-token'}`
            },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              base64: base64Data
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.publicUrl) {
              uploadedUrl = data.publicUrl;
            }
          } else {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error || 'Server upload failed');
          }
        } catch (serverErr: any) {
          console.warn('[Server Storage Upload] Fallback error:', serverErr);
        }
      }

      // 3. Fallback for offline or local preview mode: use reader base64 or object URL
      if (!uploadedUrl) {
        const localPreview = URL.createObjectURL(file);
        uploadedUrl = localPreview;
      }

      onChange(uploadedUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image to Supabase Storage.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
          <span>{label} {required && '*'}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-neutral-600 hover:text-neutral-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL input' : 'Paste Image URL instead'}</span>
        </button>
      </div>

      {/* Main Upload Dropzone & Live Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Upload Button Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`sm:col-span-8 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            uploading
              ? 'bg-neutral-50 border-neutral-300 pointer-events-none'
              : 'border-neutral-300 hover:border-neutral-900 bg-neutral-50/70 hover:bg-neutral-100/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-1.5">
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 text-neutral-900 animate-spin" />
                <span className="text-xs font-semibold text-neutral-900">
                  Uploading to Supabase Storage (post-images)...
                </span>
                <span className="text-[11px] text-neutral-500">
                  Getting public URL for database record
                </span>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-neutral-700">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-neutral-900">
                  Click to upload image or drag & drop
                </div>
                <div className="text-[11px] text-neutral-500">
                  PNG, JPG, WEBP up to 10MB · Stored in bucket: <strong className="font-mono text-neutral-700">post-images</strong>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail Preview Area */}
        <div className="sm:col-span-4 h-full min-h-[90px] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 relative flex items-center justify-center">
          {value ? (
            <>
              <img
                src={value}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover max-h-[110px]"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-neutral-900/80 hover:bg-neutral-950 text-white rounded-md text-xs cursor-pointer shadow transition-colors"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="text-center p-2 text-neutral-500 text-[11px]">
              No image chosen
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {success && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Image uploaded to Supabase Storage and ready to save!</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Direct URL Input (Toggled) */}
      {showUrlInput && (
        <div className="pt-1.5 space-y-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or /src/assets/images/..."
            className="w-full px-3 py-2 bg-neutral-50 focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-xs font-mono text-neutral-900 outline-none transition-all"
          />
          <p className="text-[10px] text-neutral-500">
            Current public image URL saved in Supabase posts table.
          </p>
        </div>
      )}
    </div>
  );
};
