
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { SensitivityLevel } from '../types';

interface SettingsProps {
  sensitivity: SensitivityLevel;
  setSensitivity: (level: SensitivityLevel) => void;
}

const Settings: React.FC<SettingsProps> = ({ sensitivity, setSensitivity }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-200">
        <SettingsIcon className="h-6 w-6 text-blue-400" />
        {t('settings.title')}
      </h3>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {t('settings.sensitivity.label')}
        </label>
        <div className="flex rounded-md shadow-sm bg-slate-900 border border-slate-600">
          <button
            onClick={() => setSensitivity('standard')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${sensitivity === 'standard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            aria-pressed={sensitivity === 'standard'}
          >
            {t('settings.sensitivity.standard')}
          </button>
          <button
            onClick={() => setSensitivity('high')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${sensitivity === 'high' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            aria-pressed={sensitivity === 'high'}
          >
            {t('settings.sensitivity.high')}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {sensitivity === 'standard' ? t('settings.sensitivity.standardDesc') : t('settings.sensitivity.highDesc')}
        </p>
      </div>
    </div>
  );
};

export default Settings;
