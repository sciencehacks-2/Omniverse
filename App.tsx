import React, { useState, useEffect } from 'react';
import { FirebaseConfig, LogEntry, Tab } from './types';
import ConfigForm from './components/ConfigForm';
import ControlPanel from './components/ControlPanel';
import ConsoleLog from './components/ConsoleLog';
import { Settings, Flame, Command } from 'lucide-react';

const DEFAULT_CONFIG: FirebaseConfig = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  databasePath: '/devices/esp32/command'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CONTROL);
  const [config, setConfig] = useState<FirebaseConfig>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('firebase_iot_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
  }, []);

  const handleConfigSave = (newConfig: FirebaseConfig) => {
    setConfig(newConfig);
    localStorage.setItem('firebase_iot_config', JSON.stringify(newConfig));
    addLog('success', 'Firebase configuration saved locally.');
    setActiveTab(Tab.CONTROL);
  };

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-200 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shadow-lg text-firebase-500">
            <Flame size={24} fill="currentColor" />
          </div>
          <h1 className="hidden lg:block font-bold text-xl tracking-tight text-white">IoT Bridge</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          <button
            onClick={() => setActiveTab(Tab.CONTROL)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
              activeTab === Tab.CONTROL 
                ? 'bg-firebase-600/10 text-firebase-500 shadow-sm border border-firebase-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Command size={20} />
            <span className="hidden lg:inline font-medium">Control Center</span>
          </button>

          <button
            onClick={() => setActiveTab(Tab.CONFIG)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
              activeTab === Tab.CONFIG 
                ? 'bg-blue-600/10 text-blue-400 shadow-sm border border-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings size={20} />
            <span className="hidden lg:inline font-medium">Settings</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 hidden md:block">
            <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-medium text-slate-300">
                        {config.apiKey ? 'Configured' : 'Missing Config'}
                    </span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (Mobile Only) */}
        <header className="md:hidden p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-white">IoT Bridge</span>
            <div className={`w-2 h-2 rounded-full ${config.apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {activeTab === Tab.CONFIG && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
               <ConfigForm onSave={handleConfigSave} initialConfig={config} />
            </div>
          )}
          
          {activeTab === Tab.CONTROL && (
            <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {!config.apiKey ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="p-4 bg-slate-800 rounded-full">
                            <Settings size={40} className="text-slate-400"/>
                        </div>
                        <h2 className="text-xl font-bold text-white">Configuration Required</h2>
                        <p className="text-slate-400 max-w-md">
                            Please provide your Firebase Project configuration to connect.
                        </p>
                        <button 
                            onClick={() => setActiveTab(Tab.CONFIG)}
                            className="bg-firebase-600 hover:bg-firebase-700 text-slate-900 px-6 py-2 rounded-lg font-bold transition"
                        >
                            Open Settings
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 h-full">
                        <div className="shrink-0">
                            <h2 className="text-2xl font-bold text-white">Control Center</h2>
                            <p className="text-slate-400">Manage your device via Firebase Realtime Database.</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ControlPanel config={config} addLog={addLog} />
                        </div>
                    </div>
                )}
            </div>
          )}
        </div>

        {/* Bottom Log Panel */}
        <div className="h-64 md:h-48 border-t border-slate-800 shrink-0 bg-slate-950 p-4">
            <ConsoleLog logs={logs} onClear={clearLogs} />
        </div>
      </main>
    </div>
  );
};

export default App;
