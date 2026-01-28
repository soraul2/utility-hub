import React from 'react';
import { usePhoneCost } from './hooks/usePhoneCost';

import { CarrierPlanForm } from './components/CarrierPlanForm';
import { MvnoPlanForm } from './components/MvnoPlanForm';
import { ComparisonResult } from './components/ComparisonResult';
import { GlassButton } from '../../../components/ui/GlassButton';

const PhoneCost: React.FC = () => {
      const { state, actions } = usePhoneCost();

      // Auto-calculate logic or manual?
      // Design spec implies specific calculate button, but also "input change -> button click -> calculate".
      // Or "Calculate on button click". Let's stick to manual button for now as per spec validation rule.

      return (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
                  <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
                              <i className="fa-solid fa-coins text-yellow-500"></i> 휴대폰 24개월 총 비용 비교
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                              통신사 약정과 자급제+알뜰폰 조합, 진짜 싼 건 어느 쪽일까요?
                        </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <CarrierPlanForm
                              input={state.carrierPlan}
                              errors={state.errors}
                              vatIncluded={state.carrierVatIncluded}
                              onToggleVat={() => actions.toggleVat('carrier')}
                              onFieldChange={actions.setCarrierField}
                              onAddAddon={actions.addAddon}
                              onRemoveAddon={actions.removeAddon}
                              onUpdateAddon={actions.updateAddon}
                        />
                        <MvnoPlanForm
                              input={state.mvnoPlan}
                              errors={state.errors}
                              vatIncluded={state.mvnoVatIncluded}
                              onToggleVat={() => actions.toggleVat('mvno')}
                              onFieldChange={actions.setMvnoField}
                        />
                  </div>


                  <div className="flex justify-center mb-10">
                        <GlassButton
                              size="lg"
                              className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                              onClick={actions.calculate}
                        >
                              🚀 24개월 총액 비교하기
                        </GlassButton>
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <ComparisonResult result={state.result} />
                  </div>
            </div >
      );
};

export default PhoneCost;
