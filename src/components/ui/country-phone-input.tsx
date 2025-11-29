import * as React from "react";
import { Check, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface Country {
  name: string;
  flag: string;
  code: string;
  phoneCode: string;
  placeholder: string;
  format: string;
}

const LATIN_AMERICAN_COUNTRIES: Country[] = [
  { name: 'Estados Unidos', flag: '🇺🇸', code: 'US', phoneCode: '+1', placeholder: '(555) 123-4567', format: '(###) ###-####' },
  { name: 'México', flag: '🇲🇽', code: 'MX', phoneCode: '+52', placeholder: '55 1234 5678', format: '## #### ####' },
  { name: 'Colombia', flag: '🇨🇴', code: 'CO', phoneCode: '+57', placeholder: '300 123 4567', format: '### ### ####' },
  { name: 'Venezuela', flag: '🇻🇪', code: 'VE', phoneCode: '+58', placeholder: '412 123 4567', format: '### ### ####' },
  { name: 'Guatemala', flag: '🇬🇹', code: 'GT', phoneCode: '+502', placeholder: '5123 4567', format: '#### ####' },
  { name: 'El Salvador', flag: '🇸🇻', code: 'SV', phoneCode: '+503', placeholder: '7123 4567', format: '#### ####' },
  { name: 'Honduras', flag: '🇭🇳', code: 'HN', phoneCode: '+504', placeholder: '9123-4567', format: '####-####' },
  { name: 'Nicaragua', flag: '🇳🇮', code: 'NI', phoneCode: '+505', placeholder: '8123 4567', format: '#### ####' },
  { name: 'Costa Rica', flag: '🇨🇷', code: 'CR', phoneCode: '+506', placeholder: '8123 4567', format: '#### ####' },
  { name: 'Panamá', flag: '🇵🇦', code: 'PA', phoneCode: '+507', placeholder: '6123-4567', format: '####-####' },
  { name: 'Cuba', flag: '🇨🇺', code: 'CU', phoneCode: '+53', placeholder: '5 123 4567', format: '# ### ####' },
  { name: 'República Dominicana', flag: '🇩🇴', code: 'DO', phoneCode: '+1', placeholder: '809 123 4567', format: '### ### ####' },
  { name: 'Puerto Rico', flag: '🇵🇷', code: 'PR', phoneCode: '+1', placeholder: '787 123 4567', format: '### ### ####' },
  { name: 'Ecuador', flag: '🇪🇨', code: 'EC', phoneCode: '+593', placeholder: '99 123 4567', format: '## ### ####' },
  { name: 'Perú', flag: '🇵🇪', code: 'PE', phoneCode: '+51', placeholder: '912 345 678', format: '### ### ###' },
  { name: 'Bolivia', flag: '🇧🇴', code: 'BO', phoneCode: '+591', placeholder: '7 123 4567', format: '# ### ####' },
  { name: 'Chile', flag: '🇨🇱', code: 'CL', phoneCode: '+56', placeholder: '9 1234 5678', format: '# #### ####' },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR', phoneCode: '+54', placeholder: '11 1234-5678', format: '## ####-####' },
  { name: 'Uruguay', flag: '🇺🇾', code: 'UY', phoneCode: '+598', placeholder: '91 234 567', format: '## ### ###' },
  { name: 'Paraguay', flag: '🇵🇾', code: 'PY', phoneCode: '+595', placeholder: '981 123456', format: '### ######' },
  { name: 'Brasil', flag: '🇧🇷', code: 'BR', phoneCode: '+55', placeholder: '11 91234-5678', format: '## #####-####' },
];

interface CountryPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: Country) => void;
  defaultCountryCode?: string;
  disabled?: boolean;
  required?: boolean;
  showValidation?: boolean;
}

export function CountryPhoneInput({ 
  value, 
  onChange, 
  onCountryChange,
  defaultCountryCode,
  disabled, 
  required,
  showValidation = true 
}: CountryPhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(
    LATIN_AMERICAN_COUNTRIES.find(c => c.code === defaultCountryCode) || LATIN_AMERICAN_COUNTRIES[0]
  );
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [isTouched, setIsTouched] = React.useState(false);

  // Extract phone number without country code
  React.useEffect(() => {
    if (value.startsWith(selectedCountry.phoneCode)) {
      setPhoneNumber(value.slice(selectedCountry.phoneCode.length).trim());
    } else {
      setPhoneNumber(value);
    }
  }, [value, selectedCountry.phoneCode]);

  // Format phone number according to country format
  const formatPhoneNumber = (input: string, format: string) => {
    const digits = input.replace(/\D/g, '');
    let result = '';
    let digitIndex = 0;
    
    for (const char of format) {
      if (char === '#') {
        if (digitIndex < digits.length) {
          result += digits[digitIndex];
          digitIndex++;
        }
      } else {
        if (digitIndex < digits.length && digitIndex > 0) {
          result += char;
        }
      }
    }
    return result;
  };

  // Get expected length from format
  const getExpectedLength = (format: string) => {
    return format.replace(/[^#]/g, '').length;
  };

  // Validate phone number
  const isValid = React.useMemo(() => {
    const digits = phoneNumber.replace(/\D/g, '');
    const expectedLength = getExpectedLength(selectedCountry.format);
    return digits.length === expectedLength;
  }, [phoneNumber, selectedCountry.format]);

  const currentLength = phoneNumber.replace(/\D/g, '').length;
  const expectedLength = getExpectedLength(selectedCountry.format);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');
    const formatted = formatPhoneNumber(digits, selectedCountry.format);
    
    setPhoneNumber(formatted);
    setIsTouched(true);
    onChange(`${selectedCountry.phoneCode}${digits}`);
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);
    const digits = phoneNumber.replace(/\D/g, '');
    onChange(`${country.phoneCode}${digits}`);
    onCountryChange?.(country);
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-[140px] justify-between bg-background"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.phoneCode}</span>
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 bg-background z-50">
          <Command>
            <CommandInput placeholder="Buscar país..." className="h-9" />
            <CommandList>
              <CommandEmpty>No se encontró el país.</CommandEmpty>
              <CommandGroup>
                {LATIN_AMERICAN_COUNTRIES.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={() => handleCountryChange(country)}
                    className="cursor-pointer"
                  >
                    <span className="text-xl mr-2">{country.flag}</span>
                    <span className="flex-1">{country.name}</span>
                    <span className="text-muted-foreground text-sm">{country.phoneCode}</span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selectedCountry.code === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <div className="flex-1 relative">
        <Input
          type="tel"
          placeholder={selectedCountry.placeholder}
          value={phoneNumber}
          onChange={handlePhoneChange}
          disabled={disabled}
          required={required}
          className={cn(
            "pr-10",
            showValidation && isTouched && (
              isValid 
                ? "border-success focus-visible:ring-success" 
                : "border-destructive focus-visible:ring-destructive"
            )
          )}
        />
        {showValidation && isTouched && phoneNumber && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
        )}
        {showValidation && isTouched && !isValid && phoneNumber && (
          <p className="text-xs text-destructive mt-1">
            {currentLength} de {expectedLength} dígitos
          </p>
        )}
      </div>
    </div>
  );
}

export { LATIN_AMERICAN_COUNTRIES };
