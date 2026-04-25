"use client";

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
        if (segments.length > 0 && segments[0] && ['es', 'en', 'pt'].includes(segments[0])) {
            segments[0] = langCode;
        } else {
            segments.unshift(langCode);
        }
        window.location.href = `/${segments.join('/')}`;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-sm font-medium text-white">
                <span className="uppercase">{currentLang}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {LANGUAGES.map((lang) => (
                        <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${currentLang === lang.code ? 'text-accent-green font-medium bg-gray-50' : 'text-gray-600'}`}>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
