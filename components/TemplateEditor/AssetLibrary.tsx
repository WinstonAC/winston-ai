import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { FiUpload, FiImage, FiVideo, FiTrash2, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { AppError, handleError, showErrorToast } from '../../lib/error';

interface Asset {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
  createdAt: Date;
}

interface AssetLibraryProps {
  onClose: () => void;
  onSelect: (asset: Asset) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ onClose, onSelect }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (!response.ok) throw new AppError('Failed to fetch assets', 'network_error');
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      const appError = handleError(error);
      showErrorToast(appError);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new AppError('Failed to delete asset', 'api_error');
      
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      toast.success('Asset deleted successfully');
    } catch (error) {
      const appError = handleError(error);
      showErrorToast(appError);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    const formData = new FormData();
    
    for (const file of acceptedFiles) {
      formData.append('file', file);

      try {
        const response = await fetch('/api/assets/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new AppError('Upload failed', 'api_error');
        
        const newAsset = await response.json();
        setAssets(prev => [...prev, newAsset]);
        toast.success('Asset uploaded successfully');
      } catch (error) {
        const appError = handleError(error);
        showErrorToast(appError);
      }
    }
    setUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black text-white p-8 border-4 border-white w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">ASSET LIBRARY</h2>
          <button
            onClick={onClose}
            className="p-2 border-4 border-white hover:bg-white hover:text-black transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`p-8 border-4 border-dashed border-white mb-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'bg-white text-black' : 'hover:bg-white hover:text-black'
          }`}
        >
          <input {...getInputProps()} />
          <FiUpload size={48} className="mx-auto mb-4" />
          <p className="text-xl font-bold">
            {isDragActive ? 'DROP FILES HERE' : 'DRAG & DROP FILES HERE'}
          </p>
          <p className="text-sm mt-2">or click to select files</p>
          <p className="text-xs mt-1">
            Supported formats: PNG, JPG, GIF, MP4, WebM, OGG (max 10MB)
          </p>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-xl font-bold">UPLOADING...</div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="text-center py-8">LOADING ASSETS...</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8">NO ASSETS AVAILABLE</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 border-4 border-white hover:bg-white hover:text-black transition-colors cursor-pointer relative group"
                  onClick={() => onSelect(asset)}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-800 mb-2">
                    {asset.type === 'image' ? (
                      <Image
                        src={asset.url}
                        alt={asset.name}
                        width={100}
                        height={100}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <FiVideo size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold truncate">{asset.name}</div>
                  <div className="text-xs">{formatFileSize(asset.size)}</div>
                  <button
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset.id);
                    }}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetLibrary; 