import React, { useState, useEffect } from 'react';
import { FirebaseConfig } from '../types';
import { sendCommand, subscribeToCommand } from '../services/firebaseService';
import { generateEspCommand } from '../services/geminiService';
import { Send, Cpu, Radio, Wand2, Loader2, Database, MessageSquare } from 'lucide-react';

interface ControlPanelProps {
  config: FirebaseConfig;
  addLog: (type: 'info' | 'success' | 'error' | 'warning', message: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, addLog }) => {
  const [currentRemoteData, setCurrentRemoteData] = useState<string>('Waiting for data...');
  const [manualCommand, setManualCommand] = useState<string>('{"action": "HELLO", "val": 1}');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [textMessage, setTextMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!config.apiKey) return;

    addLog('info', 'Subscribing to Firebase Realtime Database...');
    const unsubscribe = subscribeToCommand(config, (data) => {
      setIsConnected(true);
      if (data === null) {
        setCurrentRemoteData("null (No data at this path)");
      } else {
        setCurrentRemoteData(JSON.stringify(data, null, 2));
      }
    });

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const handleSend = async (content: string, type: 'Manual' | 'AI' | 'Text') => {
    setIsSending(true);
    addLog('info', `Writing ${type} command to Firebase...`);
    try {
      let payload = content;
      // Try to parse as JSON to send an object, otherwise send string
      try {
         const json = JSON.parse(content);
         if (!json.timestamp) json.timestamp = Date.now();
         payload = json;
      } catch (e) {
         // Keep as string
      }

      await sendCommand(config, payload);
      addLog('success', 'Data successfully written to Firebase!');
    } catch (error: any) {
      addLog('error', `Write failed: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleTextSend = async () => {
    if (!textMessage.trim()) return;
    
    // Simple protocol: action=PRINT, text=...
    const payload = JSON.stringify({
      action: "PRINT",
      text: textMessage,
      timestamp: Date.now()
    });
    
    await handleSend(payload, 'Text');
    setTextMessage('');
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    addLog('info', 'Asking Gemini to generate command...');
    
    try {
      const command = await generateEspCommand(aiPrompt);
      addLog('success', 'AI generated a command.');
      setManualCommand(command); 
    } catch (error: any) {
      addLog('error', `AI Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const presetCommands = [
    { label: "LED ON", payload: '{"action": "SET_LED", "state": true}' },
    { label: "LED OFF", payload: '{"action": "SET_LED", "state": false}' },
    { label: "Reboot", payload: '{"action": "REBOOT"}' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Column: Controls */}
      <div className="space-y-6 overflow-y-auto pr-2">
        
        {/* AI Section */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Wand2 size={100} />
            </div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Wand2 className="text-purple-400" size={20}/> AI Command Generator
            </h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'Blink the led 5 times quickly'"
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                    onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
                <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 rounded-lg font-medium transition flex items-center gap-2"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    Generate
                </button>
            </div>
        </div>

        {/* Text Message Section */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="text-blue-400" size={20}/> Send Message
            </h3>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    placeholder="Send text to display..."
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSend()}
                />
                <button 
                    onClick={handleTextSend}
                    disabled={isSending || !textMessage}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 rounded-lg font-medium transition flex items-center gap-2"
                >
                    <Send size={20} />
                    Send
                </button>
            </div>
        </div>

        {/* Manual Section */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Cpu className="text-firebase-500" size={20}/> Manual Payload
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {presetCommands.map((cmd, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setManualCommand(cmd.payload)}
                        className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-full border border-slate-600 transition"
                    >
                        {cmd.label}
                    </button>
                ))}
            </div>

            <textarea
                value={manualCommand}
                onChange={(e) => setManualCommand(e.target.value)}
                className="w-full h-40 bg-slate-900 border border-slate-600 rounded-lg p-4 font-mono text-sm text-green-400 focus:border-firebase-500 focus:ring-1 focus:ring-firebase-500 outline-none transition mb-4"
                spellCheck={false}
            />

            <button 
                onClick={() => handleSend(manualCommand, 'Manual')}
                disabled={isSending || !config.apiKey}
                className="w-full bg-firebase-600 hover:bg-firebase-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
            >
                {isSending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} />}
                {isSending ? 'Writing...' : 'Update Realtime DB'}
            </button>
        </div>
      </div>

      {/* Right Column: Status Viewer */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden h-[500px] lg:h-auto">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Database size={16} className="text-firebase-500" />
                <h3 className="font-mono text-sm text-slate-400 uppercase tracking-wider">
                    Live Database View
                </h3>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{isConnected ? 'Live' : 'Connecting...'}</span>
                <Radio size={16} className={isConnected ? 'text-green-500 animate-pulse' : 'text-slate-600'} />
             </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-slate-900">
            <pre className="font-mono text-sm text-blue-300 whitespace-pre-wrap break-all">
                {currentRemoteData}
            </pre>
        </div>
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-xs text-slate-500 flex justify-between truncate">
            <span className="truncate max-w-[200px]">Project: {config.projectId}</span>
            <span className="truncate max-w-[200px]">Path: {config.databasePath}</span>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;