export const WelcomeIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Globe */}
    <circle cx="100" cy="100" r="60" className="fill-primary/20" />
    <circle cx="100" cy="100" r="60" className="stroke-primary" strokeWidth="2" fill="none" />
    
    {/* Latitude lines */}
    <ellipse cx="100" cy="100" rx="60" ry="20" className="stroke-primary/40" strokeWidth="1" fill="none" />
    <ellipse cx="100" cy="100" rx="60" ry="40" className="stroke-primary/40" strokeWidth="1" fill="none" />
    
    {/* Longitude line */}
    <path d="M 100 40 Q 120 100 100 160" className="stroke-primary/40" strokeWidth="1" fill="none" />
    <path d="M 100 40 Q 80 100 100 160" className="stroke-primary/40" strokeWidth="1" fill="none" />
    
    {/* People silhouettes around globe */}
    <g className="animate-float" style={{ animationDelay: '0s' }}>
      <circle cx="60" cy="70" r="8" className="fill-secondary" />
      <path d="M 60 78 L 60 95 M 55 83 L 65 83" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
    </g>
    
    <g className="animate-float" style={{ animationDelay: '0.3s' }}>
      <circle cx="140" cy="80" r="8" className="fill-accent" />
      <path d="M 140 88 L 140 105 M 135 93 L 145 93" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
    </g>
    
    <g className="animate-float" style={{ animationDelay: '0.6s' }}>
      <circle cx="100" cy="150" r="8" className="fill-primary" />
      <path d="M 100 158 L 100 175 M 95 163 L 105 163" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
    </g>
    
    {/* Connection lines */}
    <path d="M 60 70 L 100 100 L 140 80" className="stroke-primary/30" strokeWidth="1.5" strokeDasharray="3,3" />
  </svg>
);

export const PsychologicalIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hands holding heart */}
    <g className="animate-float">
      {/* Left hand */}
      <path 
        d="M 50 120 Q 60 110 70 105 L 70 95 Q 70 90 75 90 L 80 95 L 75 100 L 70 105 L 80 100" 
        className="fill-primary/60 stroke-primary" 
        strokeWidth="2"
      />
      
      {/* Right hand */}
      <path 
        d="M 150 120 Q 140 110 130 105 L 130 95 Q 130 90 125 90 L 120 95 L 125 100 L 130 105 L 120 100" 
        className="fill-primary/60 stroke-primary" 
        strokeWidth="2"
      />
    </g>
    
    {/* Heart */}
    <g className="animate-pulse">
      <path 
        d="M 100 110 C 100 110 80 90 70 90 C 60 90 55 95 55 105 C 55 120 100 145 100 145 C 100 145 145 120 145 105 C 145 95 140 90 130 90 C 120 90 100 110 100 110 Z" 
        className="fill-destructive stroke-destructive" 
        strokeWidth="2"
      />
      
      {/* Heart shine */}
      <circle cx="85" cy="100" r="4" className="fill-white/60" />
    </g>
    
    {/* Support symbols */}
    <circle cx="50" cy="60" r="15" className="fill-secondary/20 stroke-secondary" strokeWidth="2" />
    <text x="50" y="67" textAnchor="middle" className="fill-secondary text-2xl font-bold">24</text>
    
    <circle cx="150" cy="60" r="15" className="fill-accent/20 stroke-accent" strokeWidth="2" />
    <text x="150" y="67" textAnchor="middle" className="fill-accent text-2xl font-bold">7</text>
  </svg>
);

export const LegalIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Balance scale */}
    <g className="animate-float">
      {/* Scale base */}
      <rect x="90" y="150" width="20" height="8" className="fill-secondary" rx="2" />
      <rect x="97" y="80" width="6" height="70" className="fill-secondary" />
      
      {/* Balance beam */}
      <rect x="40" y="75" width="120" height="4" className="fill-secondary" rx="2" />
      
      {/* Left plate */}
      <g>
        <line x1="60" y1="77" x2="60" y2="100" className="stroke-secondary" strokeWidth="2" />
        <ellipse cx="60" cy="105" rx="25" ry="5" className="fill-primary/30 stroke-primary" strokeWidth="2" />
        
        {/* Document on left */}
        <rect x="50" y="95" width="20" height="8" className="fill-primary" rx="1" />
        <line x1="52" y1="97" x2="68" y2="97" className="stroke-white" strokeWidth="0.5" />
        <line x1="52" y1="100" x2="68" y2="100" className="stroke-white" strokeWidth="0.5" />
      </g>
      
      {/* Right plate */}
      <g>
        <line x1="140" y1="77" x2="140" y2="100" className="stroke-secondary" strokeWidth="2" />
        <ellipse cx="140" cy="105" rx="25" ry="5" className="fill-accent/30 stroke-accent" strokeWidth="2" />
        
        {/* Document on right */}
        <rect x="130" y="95" width="20" height="8" className="fill-accent" rx="1" />
        <line x1="132" y1="97" x2="148" y2="97" className="stroke-white" strokeWidth="0.5" />
        <line x1="132" y1="100" x2="148" y2="100" className="stroke-white" strokeWidth="0.5" />
      </g>
      
      {/* Top decoration */}
      <circle cx="100" cy="73" r="5" className="fill-secondary" />
    </g>
    
    {/* Legal icons around */}
    <g className="opacity-40">
      <rect x="25" y="130" width="15" height="20" className="stroke-primary" strokeWidth="1.5" fill="none" rx="1" />
      <line x1="27" y1="135" x2="38" y2="135" className="stroke-primary" strokeWidth="1" />
      <line x1="27" y1="140" x2="38" y2="140" className="stroke-primary" strokeWidth="1" />
      
      <rect x="160" y="130" width="15" height="20" className="stroke-accent" strokeWidth="1.5" fill="none" rx="1" />
      <line x1="162" y1="135" x2="173" y2="135" className="stroke-accent" strokeWidth="1" />
      <line x1="162" y1="140" x2="173" y2="140" className="stroke-accent" strokeWidth="1" />
    </g>
  </svg>
);

export const CommunityIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Network of people */}
    <g>
      {/* Center person */}
      <g className="animate-pulse">
        <circle cx="100" cy="100" r="15" className="fill-primary" />
        <circle cx="100" cy="100" r="15" className="stroke-primary" strokeWidth="2" fill="none" />
        <path d="M 100 115 L 100 140 M 90 125 L 110 125 M 90 140 L 95 155 M 110 140 L 105 155" 
              className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
      </g>
      
      {/* Surrounding people with animation delays */}
      <g className="animate-float" style={{ animationDelay: '0s' }}>
        <circle cx="60" cy="60" r="12" className="fill-secondary" />
        <path d="M 60 72 L 60 90 M 53 78 L 67 78" className="stroke-secondary" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      
      <g className="animate-float" style={{ animationDelay: '0.2s' }}>
        <circle cx="140" cy="60" r="12" className="fill-accent" />
        <path d="M 140 72 L 140 90 M 133 78 L 147 78" className="stroke-accent" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      
      <g className="animate-float" style={{ animationDelay: '0.4s' }}>
        <circle cx="50" cy="130" r="12" className="fill-success" />
        <path d="M 50 142 L 50 160 M 43 148 L 57 148" className="stroke-success" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      
      <g className="animate-float" style={{ animationDelay: '0.6s' }}>
        <circle cx="150" cy="130" r="12" className="fill-primary/60" />
        <path d="M 150 142 L 150 160 M 143 148 L 157 148" className="stroke-primary/60" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      
      <g className="animate-float" style={{ animationDelay: '0.8s' }}>
        <circle cx="100" cy="40" r="12" className="fill-secondary/60" />
        <path d="M 100 52 L 100 70 M 93 58 L 107 58" className="stroke-secondary/60" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
    
    {/* Connection lines */}
    <g className="opacity-30">
      <line x1="100" y1="100" x2="60" y2="60" className="stroke-primary" strokeWidth="2" strokeDasharray="3,3" />
      <line x1="100" y1="100" x2="140" y2="60" className="stroke-primary" strokeWidth="2" strokeDasharray="3,3" />
      <line x1="100" y1="100" x2="50" y2="130" className="stroke-primary" strokeWidth="2" strokeDasharray="3,3" />
      <line x1="100" y1="100" x2="150" y2="130" className="stroke-primary" strokeWidth="2" strokeDasharray="3,3" />
      <line x1="100" y1="100" x2="100" y2="40" className="stroke-primary" strokeWidth="2" strokeDasharray="3,3" />
    </g>
    
    {/* Connection nodes */}
    <circle cx="80" cy="80" r="3" className="fill-primary" />
    <circle cx="120" cy="80" r="3" className="fill-accent" />
    <circle cx="75" cy="115" r="3" className="fill-success" />
    <circle cx="125" cy="115" r="3" className="fill-secondary" />
  </svg>
);
