import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileText, X, Search, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/Button';
import ServiceStatus from '../components/ServiceStatus';

interface QueryResult {
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
  date: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

const Dashboard = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServiceOnline, setIsServiceOnline] = useState(true);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const queryInputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const baseUrl = 'https://elrigsaa.app.n8n.cloud';
  const uploadPath = 'webhook/6b848a88-eaa9-4ac3-ac16-bbc5be18572a';

  useEffect(() => {
    if (queryInputRef.current) {
      queryInputRef.current.style.height = 'auto';
      queryInputRef.current.style.height = `${Math.min(queryInputRef.current.scrollHeight, 200)}px`;
    }
  }, [query]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!isServiceOnline) {
      showNotification('Cannot upload files while service is offline', 'error');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        showNotification(`File type not supported: ${file.name}`, 'error');
        continue;
      }

      if (file.size > maxFileSize) {
        showNotification(`File too large: ${file.name} (max 10MB)`, 'error');
        continue;
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'processing'
      };

      setUploadedFiles(prev => [...prev, newFile]);

      try {
        const formData = new FormData();
        formData.append('data', file); // Changed from 'file' to 'data'

        const uploadUrl = `${baseUrl}/${uploadPath}`;
        console.log('Making upload request to:', uploadUrl);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Accept': '*/*'
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'completed' } 
              : f
          )
        );
        
        showNotification(`Successfully uploaded ${file.name}`, 'success');
      } catch (error) {
        console.error('Upload error:', error);
        
        const errorMessage = error instanceof Error 
          ? error.message
          : 'Unknown upload error';
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'error', errorMessage } 
              : f
          )
        );
        
        showNotification(
          `Failed to upload ${file.name}: ${errorMessage}`,
          'error'
        );
      }
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      showNotification('Please enter a query', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const queryUrl = `${baseUrl}/webhook/6eef3f01-48df-4509-bfae-fbb734832efe`;
      console.log('Making API request to:', queryUrl);

      const response = await fetch(queryUrl, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: query.trim() })
      });

      if (!response.ok) {
        throw new Error('Query failed');
      }

      const text = await response.text();
      
      if (!text.trim()) {
        throw new Error('Empty response from server');
      }

      try {
        const data = JSON.parse(text);
        
        const newResult: QueryResult = {
          id: Date.now().toString(),
          title: query.trim(),
          excerpt: Array.isArray(data) ? data[0]?.output || 'No results found' : data.result || 'No results found',
          relevance: 1,
          date: new Date().toLocaleString()
        };

        setResults(prev => [newResult, ...prev]);
        setQuery('');
        showNotification('Query completed successfully', 'success');
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process query';
      showNotification(errorMessage, 'error');
      console.error('Query error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceStatusChange = (status: 'checking' | 'online' | 'offline') => {
    setIsServiceOnline(status === 'online');
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mt-4 sm:mt-0">
      <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-800">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-4 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
          <div className="relative z-10 space-y-6 sm:space-y-8">
            <p className="text-blue-100 text-sm sm:text-base font-light">
              Explore your secured document repository with natural language queries
            </p>

            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-medium text-white">Upload Documents</h3>
              <div 
                className={`border-2 border-dashed rounded-lg transition-all duration-300 ${
                  isDragging ? 'border-white bg-white/20 scale-[1.02]' : 'border-blue-400/50 hover:border-white/50'
                } ${!isServiceOnline ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="p-3 sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-blue-100 text-xs sm:text-sm font-light">
                      {isServiceOnline 
                        ? 'Drag and drop your documents here, or tap to select files'
                        : 'Document upload is unavailable while service is offline'}
                    </p>
                    <input
                      type="file"
                      id="fileInput"
                      className="hidden"
                      multiple
                      onChange={handleFileInput}
                      accept=".pdf,.doc,.docx,.txt"
                      disabled={!isServiceOnline}
                    />
                    <Button
                      onClick={() => document.getElementById('fileInput')?.click()}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed w-[42px] h-[42px] p-0 flex items-center justify-center shrink-0"
                      disabled={!isServiceOnline}
                      aria-label="Upload files"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="bg-white/10 rounded-lg p-2 sm:p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <FileText className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${
                        file.status === 'completed' ? 'text-green-400' :
                        file.status === 'error' ? 'text-red-400' :
                        'text-blue-400'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-blue-200 truncate">
                          {file.status === 'processing' && 'Processing...'}
                          {file.status === 'completed' && 'Upload complete'}
                          {file.status === 'error' && file.errorMessage}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-white/50 hover:text-white transition-colors ml-2 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-medium text-white">Ask your question below</h3>
              <div className="border-2 border-blue-400/50 hover:border-white/50 rounded-lg transition-all duration-300">
                <form onSubmit={handleQuery} className="p-3 sm:p-5">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <textarea
                        ref={queryInputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleQuery(e);
                          }
                        }}
                        className="w-full bg-transparent text-white placeholder-blue-100 text-sm sm:text-base font-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[80px] max-h-[200px] custom-scrollbar"
                        disabled={isLoading || !isServiceOnline}
                      />
                      <p className="text-blue-100 text-xs sm:text-sm font-light mt-2">
                        Press Enter to Query, Shift + Enter for new line
                      </p>
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={isLoading || !isServiceOnline}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed w-[42px] h-[42px] p-0 flex items-center justify-center shrink-0"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="p-4 sm:p-8">
            <div className="space-y-4">
              {results.map((result) => (
                <div 
                  key={result.id}
                  className="bg-slate-800/50 p-4 sm:p-6 rounded-lg border border-slate-700"
                >
                  <h3 className="text-sm sm:text-base text-white font-medium mb-2 break-words">
                    {result.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 break-words">
                    {result.excerpt}
                  </p>
                  <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400">
                    <span>{result.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <ServiceStatus 
        url={`${baseUrl}/health`}
        onStatusChange={handleServiceStatusChange}
      />
    </div>
  );
};

export default Dashboard;