'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { adminApi } from '@/lib/admin/api';
import type { StorageBucket } from '@/lib/types';

interface ImageUploadProps {
  bucket: StorageBucket;
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export function ImageUpload({ bucket, value, onChange, label = 'Upload image', accept = 'image/*' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value ?? '');

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await adminApi.uploadFile(file, bucket);
      setPreview(result.url);
      onChange(result.url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold tracking-widest text-[#5A5A5A] dark:text-zinc-400 uppercase">
        {label}
      </label>
      <div
        className="border-2 border-dashed border-gold-200/50 dark:border-zinc-700 rounded-2xl p-4 bg-gray-50/50 dark:bg-zinc-900/50 hover:border-gold-400 transition-colors cursor-pointer"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview('');
                onChange('');
              }}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow cursor-pointer"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-gray-400">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-xs">Drag & drop or click to upload</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
