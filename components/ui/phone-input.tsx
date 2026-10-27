// Phone Input from Hirael <https://hirael.com/components/inputs/phone-input>
// MIT · Mohammad Shehadeh · https://github.com/MohammadShehadeh/hirael

"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export interface Country {
  iso2: string;
  name: string;
  dialCode: string;
}

// The registry item ships 25 countries; build the full list (245) from
// libphonenumber-js metadata, with names in the page language.
const PRIORITY = ["EG", "SA", "AE", "KW", "QA", "BH", "OM", "JO", "LB", "PS", "IQ", "SY", "LY", "TN", "DZ", "MA", "SD", "YE", "US", "GB", "CA", "DE", "FR", "AU"];

export function getCountryList(locale = "en"): Country[] {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const rank = (iso2: string) => {
    const i = PRIORITY.indexOf(iso2);
    return i === -1 ? PRIORITY.length : i;
  };
  return getCountries()
    .map((iso2) => ({ iso2, name: names.of(iso2) ?? iso2, dialCode: `+${getCountryCallingCode(iso2)}` }))
    .sort((a, b) => rank(a.iso2) - rank(b.iso2) || a.name.localeCompare(b.name, locale));
}

export const COUNTRIES: readonly Country[] = getCountryList("en");

export function flagEmoji(iso2: string) {
  return String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

const findCountry = (iso2: string, list: readonly Country[] = COUNTRIES): Country | undefined => {
  return list.find((c) => c.iso2 === iso2.toUpperCase());
};

const digitsOnly = (input: string): string => {
  return input.replace(/\D/g, "");
};

const parseE164 = (
  value: string | undefined,
  fallback: Country,
  list: readonly Country[] = COUNTRIES,
): { country: Country; national: string } => {
  if (!value) return { country: fallback, national: "" };
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) {
    return { country: fallback, national: digitsOnly(trimmed) };
  }
  const sorted = [...list].sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );
  for (const c of sorted) {
    if (trimmed.startsWith(c.dialCode)) {
      return {
        country: c,
        national: digitsOnly(trimmed.slice(c.dialCode.length)),
      };
    }
  }
  return { country: fallback, national: digitsOnly(trimmed) };
};

interface Ctx {
  id: string;
  countries: readonly Country[];
  searchPlaceholder: string;
  emptyText: string;
  country: Country;
  setCountry: (next: Country) => void;
  national: string;
  setNational: (next: string) => void;
  disabled?: boolean;
  open: boolean;
  setOpen: (next: boolean) => void;
}

const PhoneInputContext = React.createContext<Ctx | null>(null);

const usePhoneInput = () => {
  const ctx = React.useContext(PhoneInputContext);
  if (!ctx) {
    throw new Error(
      "PhoneInput compound parts must be used inside <PhoneInput>",
    );
  }
  return ctx;
};

export interface PhoneInputProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  id?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (e164: string) => void;
  defaultCountry?: string;
  disabled?: boolean;
  name?: string;
  children?: React.ReactNode;
  /** Language for country names, e.g. "ar" */
  locale?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

const PhoneInput = ({
  id,
  value: valueProp,
  defaultValue,
  onValueChange,
  defaultCountry = "US",
  disabled,
  name,
  className,
  children,
  locale = "en",
  searchPlaceholder = "Search countries…",
  emptyText = "No country found.",
  ...props
}: PhoneInputProps) => {
  const reactId = React.useId();
  const fieldId = id ?? reactId;

  const countries = React.useMemo(() => getCountryList(locale), [locale]);
  const fallback = React.useMemo<Country>(
    () => findCountry(defaultCountry, countries) ?? countries[0],
    [defaultCountry, countries],
  );

  const [country, setCountryState] = React.useState<Country>(
    () => parseE164(valueProp ?? defaultValue, fallback, countries).country,
  );
  const [national, setNationalState] = React.useState<string>(
    () => parseE164(valueProp ?? defaultValue, fallback, countries).national,
  );
  const [open, setOpen] = React.useState(false);

  const isControlled = valueProp !== undefined;

  const lastSeen = React.useRef<string | undefined>(valueProp);
  React.useEffect(() => {
    if (!isControlled) return;
    if (lastSeen.current === valueProp) return;
    lastSeen.current = valueProp;
    const parsed = parseE164(valueProp, fallback, countries);
    setCountryState(parsed.country);
    setNationalState(parsed.national);
  }, [isControlled, valueProp, fallback, countries]);

  const emit = React.useCallback(
    (c: Country, n: string) => {
      const digits = digitsOnly(n);
      const e164 = digits ? `${c.dialCode}${digits}` : "";
      lastSeen.current = e164;
      onValueChange?.(e164);
    },
    [onValueChange],
  );

  const setCountry = React.useCallback(
    (next: Country) => {
      setCountryState(next);
      emit(next, national);
    },
    [emit, national],
  );

  const setNational = React.useCallback(
    (next: string) => {
      setNationalState(next);
      emit(country, next);
    },
    [emit, country],
  );

  const ctx = React.useMemo<Ctx>(
    () => ({
      id: fieldId,
      countries,
      searchPlaceholder,
      emptyText,
      country,
      setCountry,
      national,
      setNational,
      disabled,
      open,
      setOpen,
    }),
    [fieldId, countries, searchPlaceholder, emptyText, country, setCountry, national, setNational, disabled, open],
  );

  const nationalDigits = digitsOnly(national);
  const e164 = nationalDigits ? `${country.dialCode}${nationalDigits}` : "";

  return (
    <PhoneInputContext.Provider value={ctx}>
      <InputGroup
        data-slot="phone-input"
        data-disabled={disabled || undefined}
        className={cn(disabled && "opacity-60", className)}
        {...props}
      >
        {children}
        {name && <input type="hidden" name={name} value={e164} />}
      </InputGroup>
    </PhoneInputContext.Provider>
  );
};

type PhoneInputCountrySelectProps = Omit<
  React.ComponentProps<"button">,
  "children" | "type"
>;

const PhoneInputCountrySelect = ({
  className,
  ...props
}: PhoneInputCountrySelectProps) => {
  const ctx = usePhoneInput();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <InputGroupAddon
      align="inline-start"
      data-slot="phone-input-country-select"
      className="cursor-pointer"
    >
      <Popover open={ctx.open} onOpenChange={ctx.setOpen}>
        <PopoverTrigger asChild>
          <InputGroupButton
            type="button"
            size="sm"
            role="combobox"
            aria-expanded={ctx.open}
            aria-haspopup="listbox"
            aria-label={`Country code, currently ${ctx.country.name} ${ctx.country.dialCode}`}
            disabled={ctx.disabled}
            data-state={ctx.open ? "open" : "closed"}
            className={cn("gap-1.5 font-mono text-xs", className)}
            {...props}
          >
            <span className="text-base leading-none" aria-hidden>
              {flagEmoji(ctx.country.iso2)}
            </span>
            <span className="text-muted-foreground">
              {ctx.country.dialCode}
            </span>
            <ChevronDown
              className={cn(
                "size-3 text-muted-foreground transition-transform duration-150",
                ctx.open && "rotate-180",
              )}
            />
          </InputGroupButton>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-64 p-0"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Command loop>
            <CommandInput ref={inputRef} placeholder={ctx.searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{ctx.emptyText}</CommandEmpty>
              <CommandGroup>
                {ctx.countries.map((c) => (
                  <CommandItem
                    key={c.iso2}
                    value={`${c.name} ${c.iso2} ${c.dialCode}`}
                    onSelect={() => {
                      ctx.setCountry(c);
                      ctx.setOpen(false);
                    }}
                    className="justify-between"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-base leading-none" aria-hidden>
                        {flagEmoji(c.iso2)}
                      </span>
                      <span className="min-w-0 truncate">{c.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                        {c.dialCode}
                      </span>
                      {ctx.country.iso2 === c.iso2 && (
                        <Check
                          className="size-3.5 text-foreground"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </InputGroupAddon>
  );
};

type PhoneInputFieldProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange" | "id"
>;

const PhoneInputField = ({
  placeholder = "Phone number",
  onBlur,
  inputMode = "tel",
  className,
  ...props
}: PhoneInputFieldProps) => {
  const ctx = usePhoneInput();
  return (
    <InputGroupInput
      id={ctx.id}
      type="tel"
      inputMode={inputMode}
      autoComplete="tel-national"
      dir="ltr"
      value={ctx.national}
      placeholder={placeholder}
      disabled={ctx.disabled}
      data-slot="phone-input-field"
      className={cn("rtl:text-right", className)}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^\d\s]/g, "");
        ctx.setNational(cleaned);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        const normalized = ctx.national.replace(/\s+/g, " ").trim();
        if (normalized !== ctx.national) ctx.setNational(normalized);
      }}
      {...props}
    />
  );
};

export { PhoneInput, PhoneInputCountrySelect, PhoneInputField };

export default PhoneInput;
