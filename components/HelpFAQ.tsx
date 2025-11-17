
import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { 
    ShieldQuestion, Info, Zap, FileLock2, Briefcase, Trophy, Gavel, Package, FileCode, Signal, Landmark,
    KeyRound, WifiOff, RefreshCcw, MousePointerClick, Lock
} from 'lucide-react';

const HelpFAQ: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700 animate-fade-in max-h-[80vh] overflow-y-auto">
      <h3 id="help-modal-title" className="text-xl font-semibold mb-6 flex items-center gap-3 text-slate-100">
        <ShieldQuestion className="h-7 w-7 text-blue-400" />
        {t('help.title')}
      </h3>
      
      <div className="space-y-6 text-slate-400 text-sm">

        <div>
            <h4 className="font-bold text-lg text-slate-200 flex items-center gap-2 mb-3"><Lock className="h-5 w-5 text-blue-400" />{t('help.privacy.title')}</h4>
            <p className="mb-2">{t('help.privacy.intro')}</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
                <li><span className="font-semibold text-slate-300">{t('help.privacy.item1Title')}:</span> {t('help.privacy.item1Body')}</li>
                <li><span className="font-semibold text-slate-300">{t('help.privacy.item2Title')}:</span> {t('help.privacy.item2Body')}</li>
                <li><span className="font-semibold text-slate-300">{t('help.privacy.item3Title')}:</span> {t('help.privacy.item3Body')}</li>
            </ul>
            <p className="mt-3 font-semibold text-slate-300">{t('help.privacy.outro')}</p>
        </div>

        <div>
            <h4 className="font-bold text-lg text-slate-200 flex items-center gap-2 mb-3"><Info className="h-5 w-5 text-blue-400" />{t('help.howItWorks.title')}</h4>
            <p className="mb-2">{t('help.howItWorks.intro')}</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
                <li><span className="font-semibold text-slate-300">{t('help.howItWorks.item1Title')}:</span> {t('help.howItWorks.item1Body')}</li>
                <li><span className="font-semibold text-slate-300">{t('help.howItWorks.item2Title')}:</span> {t('help.howItWorks.item2Body')}</li>
            </ul>
        </div>
        
        <div>
            <h4 className="font-bold text-lg text-slate-200 flex items-center gap-2 mb-3"><Zap className="h-5 w-5 text-blue-400" />{t('help.bestPractices.title')}</h4>
            <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-slate-300 flex items-center gap-2"><KeyRound className="h-4 w-4"/>{t('help.bestPractices.item1Title')}:</strong> {t('help.bestPractices.item1Body')}</li>
                <li><strong className="text-slate-300 flex items-center gap-2"><FileLock2 className="h-4 w-4"/>{t('help.bestPractices.item2Title')}:</strong> {t('help.bestPractices.item2Body')}</li>
                <li><strong className="text-slate-300 flex items-center gap-2"><WifiOff className="h-4 w-4"/>{t('help.bestPractices.item3Title')}:</strong> {t('help.bestPractices.item3Body')}</li>
                <li><strong className="text-slate-300 flex items-center gap-2"><RefreshCcw className="h-4 w-4"/>{t('help.bestPractices.item4Title')}:</strong> {t('help.bestPractices.item4Body')}</li>
                <li><strong className="text-slate-300 flex items-center gap-2"><MousePointerClick className="h-4 w-4"/>{t('help.bestPractices.item5Title')}:</strong> {t('help.bestPractices.item5Body')}</li>
            </ul>
        </div>

        <div>
            <h4 className="font-bold text-lg text-slate-200 flex items-center gap-2 mb-3"><FileLock2 className="h-5 w-5 text-blue-400" />{t('help.scamTypes.title')}</h4>
            <div className="space-y-4">
                <div>
                    <h5 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Gavel className="h-5 w-5" />{t('help.scamTypes.digitalArrest.title')}</h5>
                    <p>{t('help.scamTypes.digitalArrest.body')}</p>
                </div>
                <div>
                    <h5 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Package className="h-5 w-5" />{t('help.scamTypes.fakeParcel.title')}</h5>
                    <p>{t('help.scamTypes.fakeParcel.body')}</p>
                </div>
                <div>
                    <h5 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><FileCode className="h-5 w-5" />{t('help.scamTypes.apkFraud.title')}</h5>
                    <p>{t('help.scamTypes.apkFraud.body')}</p>
                </div>
                <div>
                    <h5 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Briefcase className="h-5 w-5" />{t('help.scamTypes.jobOffer.title')}</h5>
                    <p>{t('help.scamTypes.jobOffer.body')}</p>
                </div>
                <div>
                    <h5 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Signal className="h-5 w-5" />{t('help.scamTypes.esimFraud.title')}</h5>
                    <p>{t('help.scamTypes.esimFraud.body')}</p>
                </div>
                <div>
                    <h5 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Landmark className="h-5 w-5" />{t('help.scamTypes.moneyMule.title')}</h5>
                    <p>{t('help.scamTypes.moneyMule.body')}</p>
                </div>
                <div>
                    <h5 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Trophy className="h-5 w-5" />{t('help.scamTypes.lottery.title')}</h5>
                    <p>{t('help.scamTypes.lottery.body')}</p>
                </div>
            </div>
        </div>

         <div className="pt-4 mt-4 border-t border-slate-700">
            <p className="font-semibold text-slate-300">{t('help.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
};

export default HelpFAQ;
