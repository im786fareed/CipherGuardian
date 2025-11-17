
import React from 'react';
import { Bot, LogIn } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface ThreatSimulatorProps {
  onSimulateLoginFailure: () => void;
}

const ThreatSimulator: React.FC<ThreatSimulatorProps> = ({ onSimulateLoginFailure }) => {
  const { t } = useTranslation();
  const [clicked, setClicked] = React.useState(false);

  const handleClick = () => {
    onSimulateLoginFailure();
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
  };
  
  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-200">
        <Bot className="h-6 w-6 text-blue-400" />
        {t('simulator.title')}
      </h3>
      <p className="text-sm text-slate-400 mb-4">
        {t('simulator.description')}
      </p>
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
      >
        <LogIn className="h-5 w-5" />
        {clicked ? t('simulator.button.clicked') : t('simulator.button.default')}
      </button>
       <p className="text-xs text-slate-500 mt-2">
        {t('simulator.helperText')}
      </p>
    </div>
  );
};

export default ThreatSimulator;
