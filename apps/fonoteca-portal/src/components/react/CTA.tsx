import React from 'react';
import { type translations } from '../../i18n/data';

interface CTAProps {
    content: typeof translations.es.cta;
}

export const CTA: React.FC<CTAProps> = ({ content }) => {
    return (
        <section className="py-24 bg-light-bg relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-accent-green/5 rounded-l-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="bg-primary-dark rounded-[40px] p-12 md:p-20 overflow-hidden relative shadow-2xl">
                    {/* Background Abstract Shape */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-green rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2">
                            <h2 className="text-4xl md:text-5xl text-white font-light mb-6">
                                {content.title_start} <br />
                                <strong className="text-accent-green font-bold">
                                    {content.title_strong}
                                </strong>
                            </h2>
                            <p className="text-gray-300 text-lg mb-8 max-w-md">
                                {content.desc}
                            </p>

                            <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder={content.placeholder}
                                    className="px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-accent-green focus:bg-white/20 transition-all flex-grow"
                                />
                                <button className="px-8 py-4 rounded-full bg-accent-green text-primary-dark font-bold hover:bg-white transition-colors cursor-pointer">
                                    {content.button}
                                </button>
                            </form>
                        </div>

                        <div className="md:w-1/3 relative">
                            {/* Abstract Card Representation */}
                            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-accent-green rounded-full flex items-center justify-center text-primary-dark">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                            className="w-6 h-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                                            ></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="h-2 w-24 bg-white/50 rounded mb-2"></div>
                                        <div className="h-2 w-16 bg-white/30 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded mb-3"></div>
                                <div className="h-2 w-full bg-white/10 rounded mb-3"></div>
                                <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
