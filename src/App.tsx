/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ChangeEvent } from 'react';
import { 
  FileText, 
  Upload, 
  Building2, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeTenderDocument, type CompanyInfo, type TenderAnalysisResult } from './services/geminiService';

export default function App() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'REC Engineering Company Limited',
    address: 'ABCEDFG Street'
  });

  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TenderAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'application/pdf') {
        setError('Please upload a PDF document.');
        return;
      }
      setFile(uploadedFile);
      setError(null);
      setResult(null);
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const analysis = await analyzeTenderDocument(base64, file.type, companyInfo);
          setResult(analysis);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred during analysis.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to read file.');
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <FileCheck2 size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">TenderFill AI</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Engineering Submission Assistant</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Settings */}
        <aside className="w-80 border-r border-slate-200 bg-white p-6 overflow-y-auto hidden lg:block">
          <div className="flex items-center gap-2 mb-6">
            <Building2 size={18} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900 uppercase">Proposer Profile</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Company Name</label>
              <input 
                type="text" 
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Primary Address</label>
              <textarea 
                rows={3}
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <h3 className="text-xs font-bold text-blue-900 uppercase mb-1">Standard Info</h3>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    This information will be used to automatically suggest field values in the identified tender forms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Upload Section */}
            <section>
              <div className="glass-panel p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-300 bg-white relative overflow-hidden group">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-300">
                  <Upload size={32} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                
                {file ? (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-900">Upload Tender Document</p>
                    <p className="text-sm text-slate-500">Drag and drop your 30+ page PDF or click to browse</p>
                  </div>
                )}
                
                {!file && (
                  <div className="mt-6 flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><FileText size={12} /> Limit 30MB</span>
                    <span className="flex items-center gap-1"><Search size={12} /> Scan for Forms</span>
                  </div>
                )}
              </div>

              {file && !result && !isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-center"
                >
                  <button 
                    onClick={analyzeDocument}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-200/50 cursor-pointer"
                  >
                    Start AI Extraction
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}
            </section>

            {/* Loading State */}
            {isAnalyzing && (
              <div className="h-64 flex flex-col items-center justify-center p-12 glass-panel">
                <Loader2 size={48} className="text-blue-600 animate-spin mb-6" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Analyzing Document...</h3>
                <p className="text-slate-500 max-w-sm text-center">
                  Identifying tender forms and mapping extraction fields based on your company profile. This may take 20-40 seconds for large documents.
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Results Grid */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Results Analysis</h2>
                      <p className="text-sm text-slate-500">AI has identified {result.fields.length} applicable fields across the document.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 font-bold text-sm">
                      <CheckCircle2 size={16} />
                      Scan Complete
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 col-span-full bg-white border-l-4 border-l-blue-600">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="text-blue-600 bg-blue-100 p-1.5 rounded-lg" size={32} />
                        <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">Document Summary</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-sm">{result.summary}</p>
                    </div>

                    {result.fields.map((field, idx) => (
                      <motion.div 
                        key={idx}
                        className="glass-panel group overflow-hidden bg-white"
                        whileHover={{ y: -4 }}
                      >
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Field {idx + 1}</span>
                          {field.pageNumber && (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">PAGE {field.pageNumber}</span>
                          )}
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-1">Extracted Label</h4>
                            <p className="text-sm font-bold text-slate-900">{field.label}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-1">Context in Ref</h4>
                            <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2">"{field.originalText}"</p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group/action">
                            <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2">Suggested Input</h4>
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm font-mono font-medium text-slate-900 break-words">{field.suggestedValue}</p>
                              <button 
                                onClick={() => copyToClipboard(field.suggestedValue)}
                                className="shrink-0 p-1.5 hover:bg-white hover:shadow-sm rounded transition-all text-slate-400 hover:text-blue-600 cursor-pointer"
                                title="Copy to clipboard"
                              >
                                <ClipboardCheck size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                             <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500" 
                                  style={{ width: `${field.confidence * 100}%` }}
                                />
                             </div>
                             <span className="text-[10px] font-bold text-slate-400">{(field.confidence * 100).toFixed(0)}% MATCH</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!result && !isAnalyzing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                <div className="p-6 border border-slate-200 border-dashed rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">1. Profile</h4>
                  <p className="text-xs text-slate-500">Confirm REC Engineering company details in the left sidebar.</p>
                </div>
                <div className="p-6 border border-slate-200 border-dashed rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">2. Upload</h4>
                  <p className="text-xs text-slate-500">Drop your engineering tender document (PDF format only).</p>
                </div>
                <div className="p-6 border border-slate-200 border-dashed rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">3. Extract</h4>
                  <p className="text-xs text-slate-500">Review AI-filled forms and copy values to your submission.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

