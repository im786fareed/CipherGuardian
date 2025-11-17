import React, { useState, useCallback, ChangeEvent } from 'react';
import { Scan, LoaderCircle, Upload, X } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface MediaAnalysisAreaProps {
  onScan: () => void;
  isLoading: boolean;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  setImageBase64: (base64: string | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
}

const MediaAnalysisArea: React.FC<MediaAnalysisAreaProps> = ({ 
    onScan, isLoading, imageFile, setImageFile, setImageBase64, imagePreview, setImagePreview 
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      const base64 = await fileToBase64(file);
      setImageBase64(base64);
    }
  }, [setImageFile, setImageBase64, setImagePreview]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const clearImage = () => {
      setImageFile(null);
      setImageBase64(null);
      setImagePreview(null);
  };

  return (
    <div>
        {imagePreview ? (
            <div className="relative">
                <img src={imagePreview} alt={t('imageInput.alt')} className="w-full max-h-72 object-contain rounded-md" />
                <button 
                  onClick={clearImage} 
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                  aria-label={t('imageInput.clear')}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        ) : (
            <label 
                htmlFor="image-upload" 
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-slate-800' : 'border-slate-600 bg-slate-900 hover:bg-slate-800'}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-label={t('imageInput.upload.label')}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">{t('imageInput.upload.click')}</span> {t('imageInput.upload.drag')}</p>
                    <p className="text-xs text-slate-500">{t('imageInput.upload.types')}</p>
                </div>
                <input ref={fileInputRef} id="image-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
            </label>
        )}

      <button
        onClick={onScan}
        disabled={isLoading || !imageFile}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 shadow-lg"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            {t('imageInput.button.scanning')}
          </>
        ) : (
          <>
            <Scan className="h-5 w-5" />
            {t('imageInput.button.scan')}
          </>
        )}
      </button>
    </div>
  );
};

export default MediaAnalysisArea;