
import React from 'react';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface NotificationManagerProps {
  permissionStatus: NotificationPermission;
  onRequestPermission: () => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ permissionStatus, onRequestPermission }) => {
  const { t } = useTranslation();
  
  const renderContent = () => {
    switch (permissionStatus) {
      case 'granted':
        return (
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-sm text-slate-300">{t('notifications.status.enabled')}</p>
          </div>
        );
      case 'denied':
        return (
          <div className="flex items-center gap-3">
            <BellOff className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-slate-400">{t('notifications.status.denied')}</p>
          </div>
        );
      default: // 'default'
        return (
          <div className="flex items-center gap-4">
             <BellRing className="h-6 w-6 text-yellow-400 flex-shrink-0" />
             <div>
                <p className="text-sm font-semibold text-slate-200">{t('notifications.prompt.title')}</p>
                <button
                onClick={onRequestPermission}
                className="text-sm text-blue-400 hover:text-blue-300 font-bold"
                >
                {t('notifications.prompt.button')}
                </button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-200">
        <Bell className="h-6 w-6 text-blue-400" />
        {t('notifications.title')}
      </h3>
      {renderContent()}
    </div>
  );
};

export default NotificationManager;
