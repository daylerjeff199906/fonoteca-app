import React, { useState, useEffect } from 'react';

interface PageBannerProps {
    title: string;
    subtitle: string;
    image?: string;
    breadcrumbs?: {
        backLink: string;
        backText: string;
        currentText: string;
    };
    taxonomy?: string;
}

export const PageBanner: React.FC<PageBannerProps> = ({ title, subtitle, image, breadcrumbs, taxonomy }) => {
    const defaultImage = '/images/banner_fallback.webp';
    const [currentImage, setCurrentImage] = useState<string>(defaultImage);

    // Verify if the url is valid before rendering
    useEffect(() => {
        if (!image) {
            setCurrentImage(defaultImage);
            return;
        }

        const img = new window.Image();
        img.src = image;
        
        img.onload = () => setCurrentImage(image);
        img.onerror = () => setCurrentImage(defaultImage);
    }, [image]);

    return (
        <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 bg-primary-dark">
                <img
                    key={currentImage}
                    src={currentImage}
                    alt={title}
                    className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out animate-fade-in"
                />
                <div className="absolute inset-0 bg-primary-dark/60 mix-blend-multiply"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center">
                {breadcrumbs && (
                    <div className="flex items-center justify-center gap-2 mb-8 text-sm md:text-base text-gray-300 animate-fade-up">
                        <a href={breadcrumbs.backLink} className="hover:text-accent-green hover:underline transition-colors">
                            {breadcrumbs.backText}
                        </a>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-400 cursor-default">
                            {breadcrumbs.currentText}
                        </span>
                    </div>
                )}

                {taxonomy && (
                    <div className="mb-4 text-accent-green font-bold text-xs md:text-sm uppercase tracking-widest animate-fade-up" style={{ animationDelay: "0.1s" }}>
                        {taxonomy}
                    </div>
                )}

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 tracking-wide animate-fade-up" style={{ animationDelay: taxonomy ? "0.2s" : "0s" }}>
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 font-light animate-fade-up" style={{ animationDelay: taxonomy ? "0.3s" : "0.2s" }}>
                    {subtitle}
                </p>
            </div>
        </section>
    );
};
