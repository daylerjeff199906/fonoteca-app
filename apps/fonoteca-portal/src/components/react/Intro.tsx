import React from 'react';
import { type translations } from '../../i18n/data';
import { landingImages } from '../../config/landingImages';

interface IntroProps {
    content: typeof translations.es.intro;
}

export const Intro: React.FC<IntroProps> = ({ content }) => {
    return (
        <section className="py-24 bg-white dark:bg-[#0c141d] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    {/* Text Content */}
                    <div className="w-full md:w-1/2 order-2 md:order-1 reveal-on-scroll">
                        <span className="text-accent-green font-bold tracking-widest uppercase text-sm mb-4 block">
                            {content.label}
                        </span>
                        <h2 className="text-4xl md:text-5xl text-primary-dark dark:text-white mb-8 font-light leading-tight">
                            {content.title_start} <br />
                            <strong className="font-bold">{content.title_strong}</strong>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                            {content.p1}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                            {content.p2}
                        </p>

                        <a
                            href="#"
                            className="group inline-flex items-center text-primary-dark dark:text-white font-semibold border-b-2 border-accent-green hover:text-accent-green transition-colors"
                        >
                            {content.link}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                ></path>
                            </svg>
                        </a>
                    </div>

                    {/* Image with Leaf Shape */}
                    <div className="w-full md:w-1/2 order-1 md:order-2 reveal-on-scroll delay-200">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent-green/5 dark:bg-accent-green/10 rounded-tr-[80px] rounded-bl-[80px] transform translate-x-4 translate-y-4 transition-colors"></div>
                            <img
                                src={landingImages.intro.src}
                                alt={landingImages.intro.alt}
                                className="relative z-10 w-full h-[500px] object-cover rounded-tr-[80px] rounded-bl-[80px] shadow-xl border border-gray-100 dark:border-gray-800 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
