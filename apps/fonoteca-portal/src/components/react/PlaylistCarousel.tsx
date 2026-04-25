"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { type Species } from '../../data/species'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from './ui/carousel'
import { Button } from './ui/button'
import { SpeciesCard } from './SpeciesCard'

interface PlaylistCarouselProps {
    allSpecies: Species[];
    lang: 'es' | 'en' | 'pt';
    title?: string;
    linkToFilter?: boolean;
}

export const PlaylistCarousel: React.FC<PlaylistCarouselProps> = ({ allSpecies, lang, title: propTitle, linkToFilter = false }) => {
    const [api, setApi] = useState<CarouselApi>()
    const [autoplayEnabled, setAutoplayEnabled] = useState(true)

    const carouselItems = useMemo(() => {
        if (!Array.isArray(allSpecies) || allSpecies.length === 0) return []
        // Only take the first 10 items as requested
        const top10 = allSpecies.slice(0, 10);
        
        let items = [...top10]
        // Repeat items to fill up the carousel nicely if needed
        while (items.length < 10) {
            items = [...items, ...top10]
        }
        return items
    }, [allSpecies])

    useEffect(() => {
        if (!api || !autoplayEnabled) return

        const intervalId = setInterval(() => {
            api.scrollNext()
        }, 5000)

        return () => clearInterval(intervalId)
    }, [api, autoplayEnabled])

    const t = {
        title: propTitle || (lang === 'es' ? 'Colecciones Recientes' : lang === 'pt' ? 'Coleções Recentes' : 'Latest Collections'),
        viewAll: lang === 'es' ? 'Ver todas' : lang === 'pt' ? 'Ver tudo' : 'View all',
    }

    if (!Array.isArray(allSpecies) || allSpecies.length === 0) return null

    return (
        <section id="latest-recordings" className="w-full">
            <div
                className="w-full mx-auto"
                onMouseEnter={() => setAutoplayEnabled(false)}
                onMouseLeave={() => setAutoplayEnabled(true)}
            >
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                        <div className="flex items-center gap-6">
                            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 dark:text-white">
                                {t.title}
                            </h2>
                            <div className="hidden md:flex gap-2">
                                <CarouselPrevious className="static translate-y-0 h-12 w-12 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-transparent hover:text-accent-green hover:border-accent-green transition-colors" />
                                <CarouselNext className="static translate-y-0 h-12 w-12 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-transparent hover:text-accent-green hover:border-accent-green transition-colors" />
                            </div>
                        </div>

                        <Button
                            className="rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-accent-green/90 dark:hover:bg-accent-green text-white px-8 py-4 text-sm font-medium flex items-center gap-2 h-auto"
                        >
                            <a href={`/${lang}/species`} className="flex items-center gap-2">
                                {t.viewAll}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                            </a>
                        </Button>
                    </div>

                    <CarouselContent className="-ml-6 pb-4">
                        {carouselItems.map((species, idx) => (
                            <CarouselItem
                                key={`${species.id}-${idx}`}
                                className="pl-6 md:basis-1/2 lg:basis-1/4"
                            >
                                <SpeciesCard 
                                    species={species}
                                    lang={lang}
                                    viewMode="grid"
                                    linkToFilter={linkToFilter}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    )
}
