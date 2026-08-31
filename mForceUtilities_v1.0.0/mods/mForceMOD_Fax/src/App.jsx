import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

function App() {
  const [status, setStatus] = useState('idle'); // idle, dialing, connecting, transmitting, success, error
  const [faxNumber, setFaxNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverSheet, setCoverSheet] = useState('');
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startFax = async () => {
    if (!faxNumber) return addLog('Error: No fax number provided.');
    if (!selectedFile) return addLog('Error: No document attached.');

    setStatus('dialing');
    setProgress(0);
    setLogs([]);
    addLog(`Initiating sequence...`);

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('faxNumber', faxNumber);
    formData.append('coverSheet', coverSheet);

    try {
        setStatus('connecting');
        // Small delay to show dialing state
        await new Promise(r => setTimeout(r, 1000));
        
        const response = await fetch('/api/send-fax', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
            setStatus('transmitting');
            
            let p = 5;
            const interval = setInterval(() => {
                p += 5;
                if (p > 90) p = 95;
                setProgress(p);
            }, 300);

            setTimeout(() => {
                clearInterval(interval);
                setProgress(100);
                setStatus('success');
                addLog(`Success: ${data.faxId}`);
            }, 3000);

        } else {
            throw new Error(data.error || 'Server rejected');
        }

    } catch (error) {
        console.error(error);
        setStatus('error');
        addLog('Error: ' + error.message);
    }
  };

  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setSelectedFile(null);
    setLogs([]);
    setFaxNumber('');
  };

  return (
    <div className="bg-zinc-950 text-zinc-200 font-sans min-h-screen flex items-center justify-center relative overflow-hidden selection:bg-indigo-500/30">

      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-[0.15] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <main className="relative w-full max-w-lg mx-4 z-10 fade-in">
          
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg group">
                      <span className="font-bold text-zinc-100 tracking-tighter group-hover:text-indigo-400 transition-colors">MF</span>
                  </div>
                  <div>
                      <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">mForce Fax</h1>
                      <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${status === 'idle' || status === 'success' ? 'bg-emerald-500' : status === 'error' ? 'bg-red-500' : 'bg-amber-500'} animate-pulse`}></span>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">System {status === 'idle' ? 'Online' : status}</span>
                      </div>
                  </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                  <span className="text-xs font-mono text-zinc-400">ID: <span className="text-zinc-200">TRX-9920</span></span>
              </div>
          </header>

          {/* Main Card */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl overflow-hidden relative">
              
              {/* Card Header */ }
              <div className="px-6 py-4 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/30">
                  <h2 className="text-sm font-medium text-zinc-300">Compose Transmission</h2>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Secure Line</span>
              </div>

              {/* Progress Line */}
              {status === 'transmitting' && (
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-zinc-800 z-50">
                       <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
              )}

              <div className="p-6 space-y-6">
                  
                  {/* Recipient Input */}
                  <div className="space-y-2 group">
                      <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold group-focus-within:text-indigo-400 transition-colors">Recipient Number</label>
                      <div className="relative">
                          <input 
                              type="tel" 
                              placeholder="+1 (555) 000-0000" 
                              value={faxNumber}
                              onChange={(e) => setFaxNumber(e.target.value)}
                              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono shadow-inner" 
                          />
                      </div>
                  </div>

                  {/* Cover Message */}
                  <div className="space-y-2 group">
                      <div className="flex justify-between">
                          <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold group-focus-within:text-indigo-400 transition-colors">Cover Message</label>
                          <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">Optional</span>
                      </div>
                      <textarea 
                          rows="3" 
                          placeholder="Enter secure message content..." 
                          value={coverSheet}
                          onChange={(e) => setCoverSheet(e.target.value)}
                          className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none shadow-inner"
                      ></textarea>
                  </div>

                  {/* Attachment */}
                  <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">Document Attachment</label>
                      
                      <div className="relative group">
                           <input 
                                type="file" 
                                onChange={handleFileChange}
                                className="hidden" 
                                id="file-upload" 
                            />
                           
                          {!selectedFile ? (
                              <label htmlFor="file-upload" className="block relative border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30 rounded-lg p-8 transition-all duration-300 cursor-pointer text-center bg-zinc-950/30">
                                  <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"></div>
                                  <div className="flex flex-col items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                                          <Upload size={18} />
                                      </div>
                                      <div className="text-center">
                                          <p className="text-sm text-zinc-300 font-medium">Click to upload PDF</p>
                                          <p className="text-xs text-zinc-600 mt-1">or drag and drop into this zone</p>
                                      </div>
                                  </div>
                              </label>
                          ) : (
                               <div className="relative border border-zinc-700 bg-zinc-900/50 rounded-lg p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded text-indigo-400 border border-indigo-500/20">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">{selectedFile.name}</p>
                                            <p className="text-xs text-zinc-500">Ready for transmission</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedFile(null)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors">
                                        <div className="sr-only">Remove</div>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                               </div>
                          )}
                      </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={status === 'success' || status === 'error' ? reset : startFax}
                    disabled={status === 'dialing' || status === 'connecting' || status === 'transmitting'}
                    className={`w-full relative overflow-hidden group font-semibold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] ${
                        status === 'success' 
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black' 
                        : status === 'error' 
                        ? 'bg-red-500 hover:bg-red-400 text-white'
                        : 'bg-zinc-100 hover:bg-white text-zinc-950'
                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                      {status === 'idle' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-300/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                      )}
                      
                      <span className="flex items-center justify-center gap-2">
                          {status === 'idle' ? 'Send Fax Transmission' : 
                           status === 'dialing' ? 'Dialing...' :
                           status === 'connecting' ? 'Handshaking...' :
                           status === 'transmitting' ? 'Transmitting Data...' :
                           status === 'success' ? 'Transmission Successful' : 'Transmission Failed'}
                          
                          {status === 'idle' && <svg className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                          {status === 'success' && <CheckCircle size={16} />}
                          {status === 'error' && <AlertCircle size={16} />}
                          {(status === 'dialing' || status === 'connecting' || status === 'transmitting') && <Loader className="animate-spin" size={16} />}
                      </span>
                  </button>

              </div>

              {/* Footer / Status Bar */}
              <div className="px-6 py-3 bg-zinc-950/80 border-t border-zinc-800 flex justify-between items-center text-[10px] font-mono text-zinc-600">
                  <div className="flex items-center gap-4">
                      <span>GATEWAY: <span className="text-zinc-400">PHAXIO_V2</span></span>
                      <span>ENV: <span className="text-emerald-500/80">ACTIVE</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                      <span>ENCRYPTED</span>
                  </div>
              </div>
          </div>
          
          <div className="mt-6 text-center">
              <p className="text-[10px] text-zinc-600 font-mono">mForce Secure Transmission Protocol • v2.4.0</p>
          </div>

      </main>
    </div>
  );
}

export default App;
