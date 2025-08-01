// Country and phone utilities for dynamic flags and codes

export interface CountryInfo {
  flag: string;
  code: string;
  phoneCode: string;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  // América Latina y España - países principales
  'México': { flag: '🇲🇽', code: 'MX', phoneCode: '+52' },
  'Colombia': { flag: '🇨🇴', code: 'CO', phoneCode: '+57' },
  'Venezuela': { flag: '🇻🇪', code: 'VE', phoneCode: '+58' },
  'Argentina': { flag: '🇦🇷', code: 'AR', phoneCode: '+54' },
  'Chile': { flag: '🇨🇱', code: 'CL', phoneCode: '+56' },
  'Perú': { flag: '🇵🇪', code: 'PE', phoneCode: '+51' },
  'Ecuador': { flag: '🇪🇨', code: 'EC', phoneCode: '+593' },
  'Bolivia': { flag: '🇧🇴', code: 'BO', phoneCode: '+591' },
  'Uruguay': { flag: '🇺🇾', code: 'UY', phoneCode: '+598' },
  'Paraguay': { flag: '🇵🇾', code: 'PY', phoneCode: '+595' },
  'Costa Rica': { flag: '🇨🇷', code: 'CR', phoneCode: '+506' },
  'Panamá': { flag: '🇵🇦', code: 'PA', phoneCode: '+507' },
  'Guatemala': { flag: '🇬🇹', code: 'GT', phoneCode: '+502' },
  'Honduras': { flag: '🇭🇳', code: 'HN', phoneCode: '+504' },
  'El Salvador': { flag: '🇸🇻', code: 'SV', phoneCode: '+503' },
  'Nicaragua': { flag: '🇳🇮', code: 'NI', phoneCode: '+505' },
  'República Dominicana': { flag: '🇩🇴', code: 'DO', phoneCode: '+1' },
  'Cuba': { flag: '🇨🇺', code: 'CU', phoneCode: '+53' },
  'Puerto Rico': { flag: '🇵🇷', code: 'PR', phoneCode: '+1' },
  'España': { flag: '🇪🇸', code: 'ES', phoneCode: '+34' },
  
  // Otros países comunes
  'Estados Unidos': { flag: '🇺🇸', code: 'US', phoneCode: '+1' },
  'Canadá': { flag: '🇨🇦', code: 'CA', phoneCode: '+1' },
  'Brasil': { flag: '🇧🇷', code: 'BR', phoneCode: '+55' },
  'Francia': { flag: '🇫🇷', code: 'FR', phoneCode: '+33' },
  'Italia': { flag: '🇮🇹', code: 'IT', phoneCode: '+39' },
  'Alemania': { flag: '🇩🇪', code: 'DE', phoneCode: '+49' },
  'Reino Unido': { flag: '🇬🇧', code: 'GB', phoneCode: '+44' },
};

export const getCountryInfo = (countryName?: string): CountryInfo | null => {
  if (!countryName) return null;
  
  // Buscar coincidencia exacta primero
  if (COUNTRIES[countryName]) {
    return COUNTRIES[countryName];
  }
  
  // Buscar coincidencia parcial (sin acentos)
  const normalizedInput = countryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [country, info] of Object.entries(COUNTRIES)) {
    const normalizedCountry = country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizedCountry.includes(normalizedInput) || normalizedInput.includes(normalizedCountry)) {
      return info;
    }
  }
  
  return null;
};

export const formatPhoneNumber = (phone?: string, countryInfo?: CountryInfo | null): string => {
  if (!phone) return '';
  
  if (countryInfo) {
    // Si el número ya tiene el código de país, no lo duplicar
    if (phone.startsWith(countryInfo.phoneCode)) {
      return phone;
    }
    return `${countryInfo.phoneCode} ${phone}`;
  }
  
  return phone;
};

export const getDisplayName = (fullName?: string): string => {
  if (!fullName || fullName.trim() === '') {
    return 'Usuario';
  }
  return fullName;
};

export const getUserInitials = (fullName?: string): string => {
  const displayName = getDisplayName(fullName);
  
  if (displayName === 'Usuario') {
    return 'U';
  }
  
  return displayName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};