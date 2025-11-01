import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  available: boolean;
}

const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    flag: "🇰🇪",
    available: true,
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    flag: "🇳🇬",
    available: false, // Not active yet
  },
  {
    code: "ETB",
    name: "Ethiopian Birr",
    symbol: "Br",
    flag: "🇪🇹",
    available: true,
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "USh",
    flag: "🇺🇬",
    available: true,
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "₵",
    flag: "🇬🇭",
    available: true,
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🌍",
    available: true,
  },
  {
    code: "TZS",
    name: "Tanzanian Shilling",
    symbol: "TSh",
    flag: "🇹🇿",
    available: false,
  },
  {
    code: "RWF",
    name: "Rwandan Franc",
    symbol: "RF",
    flag: "🇷🇼",
    available: false,
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    flag: "🇿🇦",
    available: false,
  },
];

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export default function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  className = "",
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentCurrency = SUPPORTED_CURRENCIES.find(
    (c) => c.code === selectedCurrency
  ) || SUPPORTED_CURRENCIES[0];

  const handleCurrencySelect = (currency: Currency) => {
    if (currency.available) {
      onCurrencyChange(currency);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 bg-surface-subtle rounded-full border border-surface hover:bg-surface-alt transition-all duration-200 shadow-sm ${className}`}
      >
        <span className="text-sm">{currentCurrency.flag}</span>
        <span className="font-medium text-sm">{currentCurrency.code}</span>
        <ChevronDown className={`w-3 h-3 text-text-subtle transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-surface-subtle border border-surface rounded-xl shadow-xl z-50 overflow-hidden">
          {SUPPORTED_CURRENCIES.filter(currency => currency.available).map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencySelect(currency)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-alt cursor-pointer ${
                currency.code === selectedCurrency ? "bg-surface-alt" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{currency.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{currency.code}</span>
                  <span className="text-xs text-text-subtle">{currency.name}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { SUPPORTED_CURRENCIES };