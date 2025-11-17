
import React from 'react';
import { LogEntry, ThreatLevel } from '../types';
import { History, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

const ThreatIcon: React.FC<{ level: ThreatLevel }> = ({ level }) => {
  const config = {
    safe: { icon: ShieldCheck, color: 'text-safe' },
    caution: { icon: ShieldQuestion, color: 'text-caution' },
    danger: { icon: ShieldAlert, color: 'text-danger' },
  };
  const { icon: Icon, color } = config[level];
  return <Icon className={`h-5 w-5 ${color}`} />;
};

const AnalysisLog: React.FC<{ log: LogEntry[] }> = ({ log }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-200">
        <History className="h-6 w-6 text-blue-400" />
        {t('log.title')}
      </h3>
      <div className="max-h-96 overflow-y-auto pr-2">
        {log.length > 0 ? (
          <ul className="space-y-4">
            {log.map((entry, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-slate-900/70 rounded-md">
                <ThreatIcon level={entry.threatLevel} />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-100 truncate pr-2">{entry.source}</p>
                    <p className="text-xs text-slate-400 flex-shrink-0">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{entry.details}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-400 py-4">{t('log.empty')}</p>
        )}
      </div>
    </div>
  );
};

export default AnalysisLog;
