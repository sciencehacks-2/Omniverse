import React, { useState, useEffect } from 'react';
import { FirebaseConfig } from '../types';
import { Save, Database, Flame } from 'lucide-react';

interface ConfigFormProps {
  onSave: (config: FirebaseConfig) => void;
  initialConfig: FirebaseConfig;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ onSave, initialConfig }) => {
  const [config, setConfig] = useState<FirebaseConfig>(initialConfig);
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const handleChange = (field: keyof FirebaseConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const parseJsonConfig = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      // Map standard firebase config object to our structure
      const newConfig: FirebaseConfig = {
        apiKey: parsed.apiKey || '',
        authDomain: parsed.authDomain || '',
        databaseURL: parsed.databaseURL || '',
        projectId: parsed.projectId || '',
        storageBucket: parsed.storageBucket || '',
        messagingSenderId: parsed.messagingSenderId || '',
        appId: parsed.appId || '',
        databasePath: config.databasePath || '/devices/esp32/command'
      };
      setConfig(newConfig);
      setJsonInput('');
    } catch (e) {
      alert("Invalid JSON");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-firebase-600 rounded-lg text-slate-900">
          <Flame className="w-6 h-6" fill="currentColor" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Firebase Configuration</h2>
          <p className="text-slate-400 text-sm">Realtime Database connection settings</p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-slate-900 rounded-lg border border-slate-700">
        <label className="block text-xs font-bold text-firebase-500 uppercase tracking-wide mb-2">Quick Import</label>
        <p className="text-sm text-slate-400 mb-2">Paste your Firebase Config object (JSON) here to auto-fill fields:</p>
        <div className="flex gap-2">
            <input 
                type="text" 
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"apiKey": "...", "authDomain": "..."}'
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-300 focus:border-firebase-500 outline-none"
            />
            <button 
                type="button" 
                onClick={parseJsonConfig}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-xs font-bold"
            >
                Import
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">API Key</label>
            <input
              type="text"
              required
              value={config.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-firebase-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Auth Domain</label>
            <input
              type="text"
              required
              value={config.authDomain}
              onChange={(e) => handleChange('authDomain', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-firebase-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Database URL</label>
            <input
              type="text"
              required
              placeholder="https://your-project.firebaseio.com"
              value={config.databaseURL}
              onChange={(e) => handleChange('databaseURL', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-firebase-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project ID</label>
            <input
              type="text"
              required
              value={config.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-firebase-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">Database Path</label>
            <div className="flex items-center">
                <span className="bg-slate-700 border border-slate-600 border-r-0 rounded-l-lg px-3 py-2 text-slate-300 text-sm font-mono">ref(db, "</span>
                <input
                type="text"
                required
                placeholder="devices/esp32/command"
                value={config.databasePath}
                onChange={(e) => handleChange('databasePath', e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 border-l-0 rounded-r-lg px-4 py-2 text-white focus:ring-2 focus:ring-firebase-500 focus:border-transparent outline-none transition font-mono text-sm"
                />
                <span className="ml-2 text-slate-500 text-sm font-mono">")</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">The path where the ESP listens (e.g., /test/data).</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700 mt-4">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-firebase-600 hover:bg-firebase-700 text-slate-900 font-bold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
          >
            <Save size={20} />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigForm;
