
import React from 'react';
import { LogEntry } from '../types';
import { LayoutDashboard } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface DashboardProps {
  log: LogEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ log }) => {
  const { t } = useTranslation();

  const totalScans = log.length;
  const highRiskCount = log.filter(entry => entry.threatLevel === 'danger').length;
  const cautionCount = log.filter(entry => entry.threatLevel === 'caution').length;
  const safeCount = log.filter(entry => entry.threatLevel === 'safe').length;

  const getPercentage = (count: number) => {
    return totalScans > 0 ? ((count / totalScans) * 100).toFixed(0) : '0';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-200">
        <LayoutDashboard className="h-6 w-6 text-blue-400" />
        {t('dashboard.title')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4 text-center">
        <div className="bg-slate-900/70 p-4 rounded-lg">
          <p className="text-3xl font-bold text-blue-400">{totalScans}</p>
          <p className="text-sm text-slate-400">{t('dashboard.totalScans')}</p>
        </div>
        <div className="bg-slate-900/70 p-4 rounded-lg">
          <p className="text-3xl font-bold text-danger">{highRiskCount}</p>
          <p className="text-sm text-slate-400">{t('dashboard.highRiskAlerts')}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('dashboard.threatDistribution')}</h4>
        <div className="w-full bg-slate-700 rounded-full h-4 flex overflow-hidden">
          <div className="bg-danger h-4" style={{ width: `${getPercentage(highRiskCount)}%` }} title={`${t('threatLevels.danger')}: ${highRiskCount}`}></div>
          <div className="bg-caution h-4" style={{ width: `${getPercentage(cautionCount)}%` }} title={`${t('threatLevels.caution')}: ${cautionCount}`}></div>
          <div className="bg-safe h-4" style={{ width: `${getPercentage(safeCount)}%` }} title={`${t('threatLevels.safe')}: ${safeCount}`}></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-danger"></div>{t('threatLevels.danger')} ({getPercentage(highRiskCount)}%)</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-caution"></div>{t('threatLevels.caution')} ({getPercentage(cautionCount)}%)</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-safe"></div>{t('threatLevels.safe')} ({getPercentage(safeCount)}%)</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
