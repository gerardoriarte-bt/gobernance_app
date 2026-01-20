
import React, { useState } from 'react';
import { useTaxonomyStore } from '../store/useTaxonomyStore';
import { useAuthStore } from '../store/useAuthStore';
import TaxonomyHeader from './TaxonomyHeader';
import DashboardView from './DashboardView';
import ConfigView from './ConfigView';
import BuilderView from './BuilderView';
import TaxonomyFooter from './TaxonomyFooter';

const TaxonomyBuilder: React.FC = () => {
  const { 
    selectedClientId, 
    selectedTenantId, 
  } = useTaxonomyStore();

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isPlanner = user?.role === 'planner';
  const canModifyConfig = isAdmin || isPlanner; 
  const canSave = selectedTenantId && selectedClientId;

  const [activeView, setActiveView] = useState<'builder' | 'config'>('builder');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <TaxonomyHeader 
        activeView={activeView} 
        setActiveView={setActiveView} 
        canModifyConfig={canModifyConfig} 
      />

      {activeView === 'config' ? (
        <ConfigView 
          setActiveView={setActiveView} 
          canSave={!!canSave} 
        />
      ) : (
        <>
          {!canSave ? (
            <DashboardView setActiveView={setActiveView} />
          ) : (
            <BuilderView setActiveView={setActiveView} />
          )}
        </>
      )}

      <TaxonomyFooter />
    </div>
  );
};

export default TaxonomyBuilder;
