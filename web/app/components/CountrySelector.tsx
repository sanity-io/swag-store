import {useState, useRef, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router';
import {SUPPORTED_LOCALES, type I18nLocale} from '~/lib/i18n';

interface CountrySelectorProps {
  currentLocale: I18nLocale;
  className?: string;
}

export function CountrySelector({
  currentLocale,
  className = '',
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locales based on search term
  const filteredLocales = SUPPORTED_LOCALES.filter(
    (locale) =>
      locale.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locale.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locale.language.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleLocaleChange = (newLocale: I18nLocale) => {
    setIsOpen(false);
    setSearchTerm('');

    // Build new path with locale
    const currentPath = location.pathname;
    const currentLocalePath = currentLocale.pathPrefix;
    let newPath = currentPath;

    if (currentLocalePath) {
      // Remove current locale from path
      newPath = currentPath.replace(currentLocalePath, '');
    }

    if (newLocale.pathPrefix) {
      // Add new locale to path
      newPath = newLocale.pathPrefix + newPath;
    }

    // Navigate to new locale
    navigate(newPath);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-black bg-transparent  border-gray-300 rounded-md hover:opacity-70 cursor-pointer outline-none "
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{currentLocale.flag}</span>
        <span className="hidden sm:inline">{currentLocale.currency}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-black border border-black rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-white">
            <input
              type="text"
              placeholder="Search countries, currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredLocales.map((locale) => (
              <button
                key={`${locale.language}-${locale.country}`}
                onClick={() => handleLocaleChange(locale)}
                className={`w-full flex items-center gap-3 text-white hover:text-black px-4 py-3 text-left hover:bg-brand-yellow transition-colors ${
                  locale.pathPrefix === currentLocale.pathPrefix
                    ? 'bg-brand-yellow !text-black'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{locale.flag}</span>
                <div className="flex-1">
                  <div className="font-medium ">{locale.label}</div>
                  <div className="text-sm ">
                    {locale.language} • {locale.currency}
                  </div>
                </div>
                {locale.pathPrefix === currentLocale.pathPrefix && (
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
