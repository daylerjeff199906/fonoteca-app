import React, { useState, useRef, useEffect } from 'react';

interface LanguageSelectorProps {
    currentLang: string;
}

const LANGUAGES = [
    { code: 'es', label: 'Español', flag: '🇵🇪' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLang }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleLanguageChange = (langCode: string) => {
        if (langCode === currentLang) {
            setIsOpen(false);
            return;
        }

        const currentPath = window.location.pathname;
        const segments = currentPath.split('/').filter(Boolean);

        // If the first segment is a language code, replace it. Otherwise prepend it (though in this app structure it should always be there or be implicit default, but we use explicit routes)
        if (segments.length > 0 && ['es', 'en', 'pt'].includes(segments[0])) {
            segments[0] = langCode;
        } else {
            // Should not happen in this app structure where we are always under /[lang]/...
            // but as a fallback/safeguard
            segments.unshift(langCode);
        }

        const newPath = `/${segments.join('/')}`;
        window.location.href = newPath;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const currentLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-black/5 transition-colors text-sm font-medium text-white"
                aria-label="Select Language"
            >
                <FlagIcon code={currentLang} className="w-5 h-5 rounded-full object-cover" />
                <span className="uppercase text-white">{currentLang}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${currentLang === lang.code ? 'text-accent-green font-medium bg-gray-50' : 'text-gray-600'
                                }`}
                        >
                            <FlagIcon code={lang.code} className="w-5 h-5 rounded-full object-cover shadow-sm" />
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const FlagIcon = ({ code, className }: { code: string, className?: string }) => {
    if (code === 'es') {
        // Peru Flag
        return (
            <svg viewBox="0 0 32 32" className={className}>
                <rect fill="#D91023" width="32" height="32" />
                <rect fill="#FFFFFF" x="10" width="12" height="32" />
            </svg>
        );
    }
    if (code === 'en') {
        // USA Flag (simplified)
        return (
            <svg viewBox="0 0 32 32" className={className}>
                <rect fill="#B22234" width="32" height="32" />
                <rect fill="#FFFFFF" y="3" width="32" height="3" />
                <rect fill="#FFFFFF" y="9" width="32" height="3" />
                <rect fill="#FFFFFF" y="15" width="32" height="3" />
                <rect fill="#FFFFFF" y="21" width="32" height="3" />
                <rect fill="#FFFFFF" y="27" width="32" height="3" />
                <rect fill="#3C3B6E" width="14" height="16" />
            </svg>
        );
    }
    if (code === 'pt') {
        // Brazil Flag (simplified)
        return (
            <svg viewBox="0 0 32 32" className={className}>
                <rect fill="#009C3B" width="32" height="32" />
                <path fill="#FFDF00" d="M16 4 L28 16 L16 28 L4 16 Z" />
                <circle fill="#002776" cx="16" cy="16" r="6.5" />
            </svg>
        );
    }
    return null;
};
