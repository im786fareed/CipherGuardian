
import React from 'react';
import { Scan, LoaderCircle } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface OtpInputAreaProps {
  message: string;
  setMessage: (message: string) => void;
  onScan: () => void;
  isLoading: boolean;
}

const OtpInputArea: React.FC<OtpInputAreaProps> = ({ message, setMessage, onScan, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div>
      <label htmlFor="message-input" className="block text-lg font-medium text-slate-300 mb-2">
        {t('otpInput.label')}
      </label>
      <textarea
        id="message-input"
        rows={4}
        className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 placeholder-slate-500"
        placeholder={t('otpInput.placeholder')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
      />
      <button
        onClick={onScan}
        disabled={isLoading || !message.trim()}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-105 active:scale-100 shadow-lg"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            {t('otpInput.button.scanning')}
          </>
        ) : (
          <>
            <Scan className="h-5 w-5" />
            {t('otpInput.button.scan')}
          </>
        )}
      </button>
    </div>
  );
};

export default OtpInputArea;
