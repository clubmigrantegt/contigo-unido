// Country and phone utilities for dynamic flags and codes

export interface CountryInfo {
  flag: string;
  code: string;
  phoneCode: string;
  placeholder?: string;
  format?: string;
}

export const COUNTRIES: Record<string, CountryInfo> = {
  // América Latina y España - países principales
  'Estados Unidos': { flag: '🇺🇸', code: 'US', phoneCode: '+1', placeholder: '(555) 123-4567', format: '(###) ###-####' },
  'México': { flag: '🇲🇽', code: 'MX', phoneCode: '+52', placeholder: '55 1234 5678', format: '## #### ####' },
  'Colombia': { flag: '🇨🇴', code: 'CO', phoneCode: '+57', placeholder: '300 123 4567', format: '### ### ####' },
  'Venezuela': { flag: '🇻🇪', code: 'VE', phoneCode: '+58', placeholder: '412 123 4567', format: '### ### ####' },
  'Guatemala': { flag: '🇬🇹', code: 'GT', phoneCode: '+502', placeholder: '5123 4567', format: '#### ####' },
  'El Salvador': { flag: '🇸🇻', code: 'SV', phoneCode: '+503', placeholder: '7123 4567', format: '#### ####' },
  'Honduras': { flag: '🇭🇳', code: 'HN', phoneCode: '+504', placeholder: '9123-4567', format: '####-####' },
  'Nicaragua': { flag: '🇳🇮', code: 'NI', phoneCode: '+505', placeholder: '8123 4567', format: '#### ####' },
  'Costa Rica': { flag: '🇨🇷', code: 'CR', phoneCode: '+506', placeholder: '8123 4567', format: '#### ####' },
  'Panamá': { flag: '🇵🇦', code: 'PA', phoneCode: '+507', placeholder: '6123-4567', format: '####-####' },
  'Cuba': { flag: '🇨🇺', code: 'CU', phoneCode: '+53', placeholder: '5 123 4567', format: '# ### ####' },
  'República Dominicana': { flag: '🇩🇴', code: 'DO', phoneCode: '+1', placeholder: '809 123 4567', format: '### ### ####' },
  'Puerto Rico': { flag: '🇵🇷', code: 'PR', phoneCode: '+1', placeholder: '787 123 4567', format: '### ### ####' },
  'Ecuador': { flag: '🇪🇨', code: 'EC', phoneCode: '+593', placeholder: '99 123 4567', format: '## ### ####' },
  'Perú': { flag: '🇵🇪', code: 'PE', phoneCode: '+51', placeholder: '912 345 678', format: '### ### ###' },
  'Bolivia': { flag: '🇧🇴', code: 'BO', phoneCode: '+591', placeholder: '7 123 4567', format: '# ### ####' },
  'Chile': { flag: '🇨🇱', code: 'CL', phoneCode: '+56', placeholder: '9 1234 5678', format: '# #### ####' },
  'Argentina': { flag: '🇦🇷', code: 'AR', phoneCode: '+54', placeholder: '11 1234-5678', format: '## ####-####' },
  'Uruguay': { flag: '🇺🇾', code: 'UY', phoneCode: '+598', placeholder: '91 234 567', format: '## ### ###' },
  'Paraguay': { flag: '🇵🇾', code: 'PY', phoneCode: '+595', placeholder: '981 123456', format: '### ######' },
  'Brasil': { flag: '🇧🇷', code: 'BR', phoneCode: '+55', placeholder: '11 91234-5678', format: '## #####-####' },
  'España': { flag: '🇪🇸', code: 'ES', phoneCode: '+34', placeholder: '612 34 56 78', format: '### ## ## ##' },
  'Canadá': { flag: '🇨🇦', code: 'CA', phoneCode: '+1', placeholder: '(555) 123-4567', format: '(###) ###-####' },
  'Francia': { flag: '🇫🇷', code: 'FR', phoneCode: '+33', placeholder: '6 12 34 56 78', format: '# ## ## ## ##' },
  'Italia': { flag: '🇮🇹', code: 'IT', phoneCode: '+39', placeholder: '312 345 6789', format: '### ### ####' },
  'Alemania': { flag: '🇩🇪', code: 'DE', phoneCode: '+49', placeholder: '151 23456789', format: '### ########' },
  'Reino Unido': { flag: '🇬🇧', code: 'GB', phoneCode: '+44', placeholder: '7400 123456', format: '#### ######' },
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