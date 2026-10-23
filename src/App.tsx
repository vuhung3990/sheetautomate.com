import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { InteractiveDemo } from './components/InteractiveDemo';
import { SecurityArchitecture } from './components/SecurityArchitecture';
import { WhenFit } from './components/WhenFit';
import { Pricing } from './components/Pricing';
import { RoiCalculator } from './components/RoiCalculator';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { IntakeModal } from './components/IntakeModal';
import { LegalModals } from './components/LegalModals';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sheetautomate_theme');
        if (stored === 'dark' || stored === 'light') {
          return stored;
        }
      } catch {
        // Fallback gracefully if localStorage is disabled or restricted
      }
    }
    return 'light';
  });

  const [intakeOpen, setIntakeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('Self-Deploy Template ($5 one-time)');
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    try {
      localStorage.setItem('sheetautomate_theme', theme);
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleOpenIntake = (planName: string = 'Configured Workflow ($35 one-time)') => {
    setSelectedPlan(planName);
    setIntakeOpen(true);
  };
  const handleCloseIntake = () => setIntakeOpen(false);

  const handleOpenLegal = (type: 'privacy' | 'terms') => setLegalType(type);
  const handleCloseLegal = () => setLegalType(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-slate-100 flex flex-col selection:bg-brand-500/30 selection:text-brand-800 dark:selection:text-brand-300 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onOpenIntake={() => handleOpenIntake('Configured Workflow ($35 one-time)')} 
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <Hero onOpenIntake={() => handleOpenIntake('Self-Deploy Template ($5 one-time)')} />
        <HowItWorks />
        <InteractiveDemo />
        <SecurityArchitecture />
        <WhenFit />
        <Pricing onOpenIntake={(plan) => handleOpenIntake(plan)} />
        <RoiCalculator onOpenIntake={() => handleOpenIntake('Configured Workflow ($35 one-time)')} />
        <Faq />
      </main>

      {/* Footer */}
      <Footer 
        onOpenIntake={() => handleOpenIntake('Self-Deploy Template ($5 one-time)')} 
        onOpenLegal={handleOpenLegal} 
      />

      {/* Interactive Modals */}
      <IntakeModal 
        isOpen={intakeOpen} 
        initialPlan={selectedPlan}
        onClose={handleCloseIntake} 
      />
      <LegalModals type={legalType} onClose={handleCloseLegal} />
    </div>
  );
}

export default App;
