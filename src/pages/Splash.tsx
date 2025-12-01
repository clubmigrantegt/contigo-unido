import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoClubMigrante from '@/assets/logo-club-migrante.png';

const Splash = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <img 
        src={logoClubMigrante} 
        alt="Club del Migrante" 
        className="w-48 h-auto animate-fade-in"
      />
    </div>
  );
};

export default Splash;