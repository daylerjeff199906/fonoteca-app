import React from 'react';
import { type translations } from '../../i18n/data';

interface FooterProps {
    content: typeof translations.es.footer;
    logoSrc: string;
}

export const Footer: React.FC<FooterProps> = ({ content, logoSrc }) => {
    return (
        <footer className="bg-primary-dark text-white pt-20 pb-10 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 lg:col-span-1">
                        <a href="#" className="group flex gap-3 items-center mb-6 transition-colors duration-300 text-white">
                            <img
                                src={logoSrc}
                                alt="Logo IIAP"
                                className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                            <span className="text-sm md:text-base font-medium max-w-[260px] leading-tight">
                                Instituto de Investigaciones de la Amazonía Peruana
                            </span>
                        </a>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            {content.description}
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-green hover:text-primary-dark transition-all duration-300 cursor-pointer">
                                <span className="sr-only">Facebook</span>
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">{content.links_title}</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-accent-green transition-colors">Inicio</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-accent-green transition-colors">{content.library}</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-accent-green transition-colors">Especies</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-accent-green transition-colors">Estadísticas</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6 text-white">{content.contact_title}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-400 mb-2">{content.address_label}</p>
                                <p className="text-gray-300 whitespace-pre-line">
                                    {content.address}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-2">{content.email_label}</p>
                                <a href="mailto:iiap@iiap.gob.pe" className="text-gray-300 hover:text-accent-green transition-colors">iiap@iiap.gob.pe</a>
                                <p className="text-sm text-gray-400 mt-4 mb-2">{content.phone_label}</p>
                                <p className="text-gray-300">+51 (065) 265515</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        {content.copyright}
                    </p>
                </div>
            </div>
        </footer>
    );
};
