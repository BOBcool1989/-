
import React, { useState, useCallback, useEffect } from 'react';
import { extractDocumentInfo } from './services/geminiService';
import { ExtractedInfo, ProcessingStatus } from './types';
import DocumentPreview from './components/DocumentPreview';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [data, setData] = useState<ExtractedInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const processImage = useCallback(async (base64: string) => {
    setPreviewUrl(base64);
    setStatus(ProcessingStatus.LOADING);
    setError(null);
    
    try {
      const info = await extractDocumentInfo(base64);
      setData(info);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "识别失败，请确保截图内容包含清晰的登记项。");
      setStatus(ProcessingStatus.ERROR);
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      processImage(base64);
    };
    reader.onerror = () => {
      setError("无法读取该文件。");
      setStatus(ProcessingStatus.ERROR);
    };
    reader.readAsDataURL(file);
  }, [processImage]);

  const handleScreenCapture = useCallback(async () => {
    try {
      // Fix: Cast video constraints to any to avoid "cursor" property type error in MediaTrackConstraints
      // @ts-ignore - getDisplayMedia might not be in older types
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const base64 = canvas.toDataURL('image/png');
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          processImage(base64);
        }, 500); // Give it a moment to render the frame
      };
    } catch (err) {
      console.error("Screen capture failed:", err);
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        setError("屏幕捕捉失败，请重试。");
      }
    }
  }, [processImage]);

  // Handle global paste event
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (!blob) continue;

          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            processImage(base64);
          };
          reader.readAsDataURL(blob);
          break; // Process only the first image found
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processImage]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-slate-50">
      <header className="w-full max-w-4xl mb-8 no-print text-center">
        <h1 className="text-3xl font-extrabold text-teal-900 mb-2 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          就业失业登记证（相关信息）数字化助手
        </h1>
        <p className="text-teal-700/80 font-medium italic">智能识别零散截图，一键还原官方登记证格式</p>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8">
        {/* Left Column: Input Control */}
        <section className="flex flex-col space-y-6 no-print">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100">
            <h2 className="text-lg font-bold text-teal-900 mb-4 border-b border-teal-50 pb-2">数据输入选项</h2>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Capture Screen Button */}
              <button 
                onClick={handleScreenCapture}
                disabled={status === ProcessingStatus.LOADING}
                className="flex items-center justify-center p-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-xl transition-all font-bold shadow-md shadow-teal-600/10 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                屏幕截图录入
              </button>

              <div className="flex items-center my-2 text-teal-200">
                <div className="flex-1 border-t border-teal-100"></div>
                <span className="px-3 text-[10px] font-bold uppercase tracking-widest">或者</span>
                <div className="flex-1 border-t border-teal-100"></div>
              </div>

              {/* Upload & Paste Area */}
              <div className="bg-teal-50/50 p-6 rounded-xl border-2 border-dashed border-teal-200 hover:border-teal-400 transition-all group relative">
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="text-teal-900 font-bold text-sm">上传图片 或 粘贴 (Ctrl+V)</span>
                  <span className="text-[10px] text-teal-600/60 mt-1">支持 JPG, PNG, WEBP</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={status === ProcessingStatus.LOADING} />
                </label>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <p className="text-[11px] text-teal-700 leading-relaxed font-medium">
                <strong>提示：</strong> 您可以使用 <span className="bg-white px-1.5 py-0.5 rounded border border-teal-200 shadow-sm text-teal-900">Win + Shift + S</span> 截取智慧就业系统界面，然后在此处直接 <span className="text-teal-900 font-bold underline decoration-teal-300">粘贴</span>。
              </p>
            </div>
          </div>

          {previewUrl && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
              <h3 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                当前处理预览
                <button onClick={() => setPreviewUrl(null)} className="hover:text-red-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </h3>
              <div className="relative rounded-lg overflow-hidden border border-teal-50">
                <img src={previewUrl} alt="Source" className="w-full h-auto max-h-[300px] object-contain bg-slate-50" />
                {status === ProcessingStatus.LOADING && (
                  <div className="absolute inset-0 bg-teal-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="text-white text-sm font-bold animate-pulse">正在提取结构化信息...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm flex items-start animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Right Column: Output Preview */}
        <section className={`flex flex-col transition-all duration-500 ${status === ProcessingStatus.SUCCESS ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-4 no-print px-2">
            <h2 className="text-xl font-bold text-teal-900 flex items-center">
              <span className="w-2 h-8 bg-teal-600 rounded-full mr-3"></span>
              登记证数字副本 (预览)
            </h2>
            {status === ProcessingStatus.SUCCESS && (
              <button 
                onClick={handlePrint}
                className="flex items-center px-6 py-2.5 bg-teal-800 text-white font-bold rounded-full hover:bg-teal-900 transition-all shadow-lg hover:shadow-teal-900/20 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                立即打印 / 存为 PDF
              </button>
            )}
          </div>

          {data ? (
            <DocumentPreview data={data} />
          ) : (
            <div className="flex-1 min-h-[600px] border-2 border-dashed border-teal-100 rounded-3xl flex items-center justify-center p-12 bg-white text-teal-200 no-print shadow-inner">
              <div className="text-center max-w-sm">
                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-teal-900 font-bold text-lg mb-2">等待数据输入</h3>
                <p className="text-teal-600/60">通过屏幕截图、粘贴或上传文件来开始数字化处理。</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-16 text-teal-900/40 text-[11px] no-print text-center max-w-2xl border-t border-teal-50 pt-4 font-bold">
        以上信息依据智慧就业系统导出生成。
      </footer>
    </div>
  );
};

export default App;
