import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface UploadScreenProps {
  onUpload: (file: File) => void;
}

export function UploadScreen({ onUpload }: UploadScreenProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
          CramJam
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Upload your PDF notes and let AI generate a custom interactive quiz for you.
        </p>
      </div>

      {!selectedFile ? (
        <div
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-colors ${
            dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
          />
          <UploadCloud className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Drag & drop your PDF here
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">or click to browse files</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50 truncate max-w-[200px] sm:max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => onUpload(selectedFile)}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
