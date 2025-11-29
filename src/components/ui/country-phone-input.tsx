import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
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
  disabled?: boolean;
  required?: boolean;
}

export function CountryPhoneInput({ value, onChange, disabled, required }: CountryPhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(LATIN_AMERICAN_COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = React.useState("");

  // Extract phone number without country code
  React.useEffect(() => {
    if (value.startsWith(selectedCountry.phoneCode)) {
      setPhoneNumber(value.slice(selectedCountry.phoneCode.length).trim());
    } else {
      setPhoneNumber(value);
    }
  }, [value, selectedCountry.phoneCode]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPhoneNumber(input);
    onChange(`${selectedCountry.phoneCode}${input}`);
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);
    // Update the full phone number with new country code
    onChange(`${country.phoneCode}${phoneNumber}`);
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
      
      <Input
        type="tel"
        placeholder={selectedCountry.placeholder}
        value={phoneNumber}
        onChange={handlePhoneChange}
        disabled={disabled}
        required={required}
        className="flex-1"
      />
    </div>
  );
}

export { LATIN_AMERICAN_COUNTRIES };
