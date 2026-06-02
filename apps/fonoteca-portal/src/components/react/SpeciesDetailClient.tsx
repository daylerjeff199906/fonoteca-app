import React, { useEffect, useState, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { motion, AnimatePresence } from 'framer-motion';
import { getSpeciesById, type Species } from '../../data/species';
import { translations, type Language } from '../../i18n/data';
import { SpeciesGallery } from './SpeciesGallery';
import { AudioPlayer } from './AudioPlayer';
import { SpeciesDistributionMap } from './SpeciesDistributionMap';
import {
    Bird,
    TrendingDown,
    MapPin,
    FileText,
    Share2,
    ChevronRight,
    Lock,
    Music,
    Activity,
    Database
} from 'lucide-react';

interface Props {
    id: string;
    lang: string;
}

const SectionHeader: React.FC<{
    title: string;
    description?: string;
    badges?: string[];
    className?: string;
}> = ({ title, description, badges, className = "" }) => (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mb-8 ${className}`}>
        <div className="space-y-1">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{title}</h3>
            {description && <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{description}</p>}
        </div>
        {badges && badges.length > 0 && (
            <div className="flex gap-2">
                {badges.map(badge => (
                    <span key={badge} className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded ${badge === 'VERIFIED' ? 'bg-accent-green text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                        }`}>
                        {badge}
                    </span>
                ))}
            </div>
        )}
    </div>
);

const AudioListTable: React.FC<{
    audios: any[];
    species: any;
    lang: string;
    onSelect: (idx: number) => void;
}> = ({ audios, species, lang, onSelect }) => {
    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">{lang === 'es' ? 'Autor' : 'Author'}</th>
                        <th className="px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">{lang === 'es' ? 'Fecha' : 'Date'}</th>
                        <th className="px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">{lang === 'es' ? 'Duración' : 'Duration'}</th>
                        <th className="px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">{lang === 'es' ? 'Fondo' : 'Background'}</th>
                        <th className="px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">{lang === 'es' ? 'Vocalización' : 'Vocalization'}</th>
                        <th className="px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px]">{lang === 'es' ? 'Localidad' : 'Locality'}</th>
                        <th className="px-4 py-3 font-bold text-gray-500 uppercase tracking-wider text-[10px] text-center">{lang === 'es' ? 'Acciones' : 'Actions'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {audios.map((audio, idx) => (
                        <tr key={audio.id || idx} onClick={() => onSelect(idx)} className="hover:bg-accent-green/5 dark:hover:bg-accent-green/10 transition-colors group cursor-pointer">
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">{species.databaseDetails?.identifiedBy || (lang === 'es' ? 'Desconocido' : 'Unknown')}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{species.databaseDetails?.occurrence_date || '-'}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{audio.duration_seconds ? `${Number(audio.duration_seconds).toFixed(2)}s` : '-'}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[120px] truncate text-xs" title={audio.background_species}>{audio.background_species || '-'}</td>
                            <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                    {audio.vocalization_type || audio.title || (lang === 'es' ? 'Canto' : 'Call')}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={species.location}>{species.location || '-'}</td>
                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSelect(idx); }}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-green/10 text-accent-green group-hover:bg-accent-green group-hover:text-white transition-colors"
                                    title={lang === 'es' ? 'Reproducir audio' : 'Play audio'}
                                >
                                    <Music size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const formatOccurrenceDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const clean = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean) || /^\d{4}-\d{2}-\d{2}/.test(clean)) {
        const parts = clean.split('T')[0].split('-');
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];
        return `${day} ${months[monthIdx]} ${year}`;
    }
    try {
        const date = new Date(clean);
        if (isNaN(date.getTime())) return clean.toUpperCase();
        const months = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
        return clean.toUpperCase();
    }
};

const parseScientificName = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return { italicName: name, authorName: '' };

    let italicWords = 2;
    if (parts.length > 2) {
        const thirdWord = parts[2];
        if (/^[a-z]/.test(thirdWord)) {
            italicWords = 3;
        }
    }

    const italicName = parts.slice(0, italicWords).join(' ');
    const authorName = parts.slice(italicWords).join(' ');
    return { italicName, authorName };
};

export const SpeciesDetailClient: React.FC<Props> = ({ id, lang }) => {
    const [species, setSpecies] = useState<Species | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('at-a-glance');
    const [selectedAudioIndex, setSelectedAudioIndex] = useState<number | null>(null);

    const currentLang = lang as Language;

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const data = await getSpeciesById(id);
                console.log(data);
                if (data) {
                    setSpecies(data);

                    // Trigger the playlist event for the persistent player
                    if (data.audios && data.audios.length > 0) {
                        const commonName = data[`commonName_${currentLang}` as keyof Species] as string;
                        const allMediaImages = [
                            ...(data.galleryImages?.map(img => img.url) || []),
                            ...(data.spectrograms?.map(img => img.url) || [])
                        ].filter(Boolean);

                        const playlist = data.audios.map((audio) => ({
                            title: audio.title || "Canto",
                            artist: commonName,
                            url: audio.url,
                            image: data.mainImage || "/images/logo-mini.webp",
                            spectrogram: audio.spectrogramImage ?? undefined,
                            images: allMediaImages
                        }));

                        const playlistData = {
                            playlist: playlist,
                            startAtIndex: 0,
                            autoplay: false,
                        };

                        (window as any).FONOTECA_PLAYLIST = playlistData;

                        const event = new CustomEvent("set-playlist", {
                            detail: playlistData,
                        });
                        window.dispatchEvent(event);
                    }
                } else {
                    setError(lang === 'pt' ? "Espécie não encontrada" : lang === 'es' ? "Especie no encontrada" : "Species not found");
                }
            } catch (err) {
                console.error("Error loading species:", err);
                setError(lang === 'es' ? "Error al cargar los datos" : "Error loading data");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [id, lang]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0c141d] flex flex-col items-center justify-center min-h-screen">
                <style>{`
                    @keyframes fadeInUpSplash {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fadeInSplash {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideBorderSplash {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    .animate-splash-up { animation: fadeInUpSplash 0.8s ease-out forwards; }
                    .animate-splash-in { opacity: 0; animation: fadeInSplash 1s ease-out 0.4s forwards; }
                    .animate-splash-border { animation: slideBorderSplash 1.5s ease-in-out infinite; }
                `}</style>
                <div className="text-white text-3xl md:text-5xl font-sans font-light tracking-[0.1em] relative select-none animate-splash-up text-center px-4 max-w-4xl leading-tight">
                    BIBLIOTECA ACÚSTICA DE FAUNA AMAZÓNICA
                    <div className="absolute -bottom-2 inset-x-0 h-1 bg-accent-green translate-x-[-100%] animate-splash-border"></div>
                </div>
                <div className="mt-8 text-gray-400 text-xs md:text-sm tracking-[0.4em] text-center max-w-md px-4 uppercase font-light animate-splash-in">
                    {lang === 'es' ? 'Cargando detalles...' : lang === 'pt' ? 'Carregando detalhes...' : 'Loading details...'}
                </div>
            </div>
        );
    }

    if (error || !species) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-gray-500">{error}</p>
                <a href={`/${lang}/species`} className="text-accent-green font-bold hover:underline">
                    {lang === 'es' ? "Volver a la lista" : lang === 'pt' ? "Voltar para lista" : "Back to list"}
                </a>
            </div>
        );
    }

    // Localized strings and taxonomy
    const commonName = species[`commonName_${currentLang}` as keyof Species] as string;
    const description = species.description[currentLang as keyof typeof species.description];
    const characteristics = species.characteristics ? species.characteristics[currentLang as keyof typeof species.characteristics] : undefined;

    const taxonomyParts = [
        species.kingdom || "Animalia",
        species.phylum,
        species.class_name,
        species.order,
        species.family,
        species.genus,
    ].filter(Boolean);
    const taxonomy = taxonomyParts.length > 0 ? taxonomyParts.join(" - ") : undefined;

    const scientificNameParsed = parseScientificName(species.scientificName);

    const breadcrumbs = [
        { name: species.kingdom || "Animalia", italic: false },
        { name: species.phylum, italic: false },
        { name: species.class_name, italic: false },
        { name: species.order, italic: false },
        { name: species.family, italic: false },
        { name: species.genus, italic: true },
    ].filter(item => item.name);

    const sections = [
        { id: 'at-a-glance', label: lang === 'es' ? 'En un vistazo' : 'At a glance' },
        { id: 'distribution', label: lang === 'es' ? 'Distribución' : 'Distribution' },
        { id: 'audios', label: lang === 'es' ? 'Audios' : 'Audios' },
        { id: 'characteristics', label: lang === 'es' ? 'Características' : 'Ecology' },
    ];

    const getDriveIframe = (url: string) => {
        if (!url) return null;
        const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        const fileId = match ? match[1] : null;
        if (fileId) {
            return `https://drive.google.com/file/d/${fileId}/preview`;
        }
        return null;
    };

    const isGoogleDriveLink = (url: string) => {
        return url.includes('docs.google.com') || url.includes('drive.google.com');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Top Spacer for Navigation */}
            <div className="bg-primary-dark h-24 w-full"></div>

            {/* Header Section (GBIF Inspired / Faithful to Image) */}
            <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-6 pt-10 pb-0 max-w-8xl relative">
                    {/* Top right metadata (Synced / Modified) */}
                    <div className="absolute top-10 right-6 hidden md:block text-right text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
                        <div>Synced 4 days ago</div>
                        <div>Modified {species.databaseDetails?.occurrence_date ? formatOccurrenceDate(species.databaseDetails.occurrence_date) : '2 February 2026'}</div>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto pb-10">
                        {/* Occurrence Badge */}
                        <div className="text-[10px] md:text-xs font-bold tracking-widest text-gray-500 uppercase flex items-center justify-center gap-2">
                            <span>{species.databaseDetails?.basisOfRecord ? species.databaseDetails.basisOfRecord.toUpperCase() : 'OCCURRENCE'}</span>
                            <span className="text-gray-300 dark:text-gray-700">|</span>
                            <span>{formatOccurrenceDate(species.databaseDetails?.occurrence_date || '2026-01-08')}</span>
                        </div>

                        {/* Scientific Name & Authorship */}
                        <h1 className="text-2xl md:text-4xl text-gray-800 dark:text-white leading-tight">
                            <span className="italic font-semibold">
                                {scientificNameParsed.italicName}
                            </span>
                            {scientificNameParsed.authorName && (
                                <span className="ml-2 text-gray-600 dark:text-gray-400 font-light text-xl md:text-2xl">
                                    {scientificNameParsed.authorName}
                                </span>
                            )}
                        </h1>

                        {/* Common Name, Language & Location */}
                        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {commonName}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">In {lang === 'es' ? 'Spanish' : lang === 'pt' ? 'Portuguese' : 'English'}</span>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                Observed in {species.databaseDetails?.country || '---'}
                            </span>
                        </div>

                        {/* Taxonomic Breadcrumbs */}
                        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[11px] md:text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <span className={`${crumb.italic ? 'italic text-accent-green font-semibold' : 'font-medium'}`}>
                                        {crumb.name}
                                    </span>
                                    {idx < breadcrumbs.length - 1 && (
                                        <span className="text-gray-300 dark:text-gray-700 font-light text-[10px]">›</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Metadata fallback for mobile */}
                    <div className="md:hidden border-t border-gray-100 dark:border-gray-900 py-3 flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                        <div>Synced 4 days ago</div>
                        <div>Modified {species.databaseDetails?.occurrence_date ? formatOccurrenceDate(species.databaseDetails.occurrence_date) : '2 February 2026'}</div>
                    </div>

                    {/* Active tab "DETAILS" at bottom left */}
                    <div className="flex border-t border-transparent pt-3 pb-0">
                        <div className="border-b-2 border-accent-green pb-3">
                            <span className="text-xs font-black tracking-widest text-accent-green uppercase select-none cursor-default">
                                {lang === 'es' ? 'DETALLES' : 'DETAILS'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Layout Body */}
            <div className="container mx-auto px-6 py-12 max-w-8xl">
                <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
                    {/* Sidebar Sticky Navigation */}
                    <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 mt-2">
                        <div className="space-y-6">
                            {/* Back to list Link */}
                            <a
                                href={`/${lang}/species`}
                                className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest text-accent-green hover:text-accent-green-dark transition-colors mb-4 group px-2"
                            >
                                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                                {lang === 'es' ? 'VOLVER A LA BIBLIOTECA' : lang === 'pt' ? 'VOLTAR PARA LISTA' : 'BACK TO LIBRARY'}
                            </a>

                            <div>
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-4 px-2">Contents</h4>
                                <nav className="space-y-1">
                                    {sections.map(section => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                                                setActiveSection(section.id);
                                            }}
                                            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === section.id
                                                ? 'bg-accent-green/10 text-accent-green'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900'
                                                }`}
                                        >
                                            {section.label}
                                            <ChevronRight size={14} className={`transition-opacity ${activeSection === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            <hr className="border-gray-100 dark:border-gray-800" />

                            <div className="space-y-4 px-2">
                                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-accent-green transition-colors group">
                                    <Share2 size={14} />
                                    <span>SHARE FACTSHEET</span>
                                </button>
                                <button className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-accent-green transition-colors group">
                                    <FileText size={14} />
                                    <span>CITATIONS</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 w-full flex flex-col gap-4">
                        {/* Section: At a glance */}
                        <section id="at-a-glance" className="scroll-mt-24">
                            <SectionHeader
                                title={lang === 'es' ? 'La Especie' : 'The Species'}
                                description={lang === 'es' ? 'Resumen general y galería de identificación visual.' : 'Quick summary and visual identification gallery.'}
                            />
                            {/* Gallery Inside Sections */}
                            {species.galleryImages && species.galleryImages.length > 0 && (
                                <div className="pt-4 mb-16">
                                    <SpeciesGallery images={species.galleryImages.map(img => img.url)} />
                                </div>
                            )}

                            {/* Detalle de la especie */}
                            {species.databaseDetails && (
                                <div className="space-y-8 mt-8">
                                    <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-sm bg-white dark:bg-gray-900">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 dark:bg-gray-800">
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800 w-1/3">{lang === 'es' ? 'Categoría / Propiedad' : 'Category / Property'}</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-800">{lang === 'es' ? 'Valor Detallado' : 'Detailed Value'}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {/* Taxonomía */}
                                                <tr className="bg-white dark:bg-gray-900 hover:bg-accent-green/5 dark:hover:bg-accent-green/10 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] border-b border-gray-100 dark:border-gray-800">
                                                        {lang === 'es' ? 'Taxonomía Científica' : 'Scientific Taxonomy'}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">
                                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-1.5 text-[11px] md:text-xs">
                                                            {taxonomyParts.map((part, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    <span className={`${idx === taxonomyParts.length - 1 ? 'text-accent-green font-bold italic' : 'text-gray-500'}`}>
                                                                        {part}
                                                                    </span>
                                                                    {idx < taxonomyParts.length - 1 && (
                                                                        <span className="text-gray-300 dark:text-gray-600">/</span>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Identification Group */}
                                                <tr className="bg-accent-green/10 dark:bg-accent-green/20">
                                                    <td colSpan={2} className="px-6 py-3 text-[10px] font-black text-accent-green uppercase tracking-[0.2em] border-b border-gray-200 dark:border-gray-800">1. {lang === 'es' ? 'Identificación y Registro' : 'Identification and Record'}</td>
                                                </tr>
                                                {[
                                                    { label: lang === 'es' ? 'ID de Ocurrencia' : 'Occurrence ID', value: species.databaseDetails.occurrenceID },
                                                    { label: lang === 'es' ? 'Fecha de Ocurrencia' : 'Occurrence Date', value: species.databaseDetails.occurrence_date },
                                                    { label: lang === 'es' ? 'Método de Identificación' : 'Identification Method', value: species.databaseDetails.identificationMethod },
                                                    { label: lang === 'es' ? 'Etapa de Vida' : 'Life Stage', value: species.databaseDetails.lifeStage },
                                                    { label: lang === 'es' ? 'Sexo' : 'Sex', value: species.databaseDetails.sex },
                                                ].filter(item => item.value).map((item, idx) => (
                                                    <tr key={`id-${idx}`} className={`${idx % 2 !== 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/80 dark:bg-gray-800/40'} hover:bg-accent-green/5 dark:hover:bg-accent-green/10 transition-colors`}>
                                                        <td className="px-6 py-3 font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] border-b border-gray-100 dark:border-gray-800">{item.label}</td>
                                                        <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">{item.value || '-'}</td>
                                                    </tr>
                                                ))}

                                                {/* Specimen Group */}
                                                <tr className="bg-accent-green/10 dark:bg-accent-green/20">
                                                    <td colSpan={2} className="px-6 py-3 text-[10px] font-black text-accent-green uppercase tracking-[0.2em] border-b border-gray-200 dark:border-gray-800">2. {lang === 'es' ? 'Especimen' : 'Specimen and Collection'}</td>
                                                </tr>
                                                {[
                                                    { label: lang === 'es' ? 'Institución' : 'Institution', value: species.databaseDetails.institutionName ? `${species.databaseDetails.institutionName} (${species.databaseDetails.institutionCode})` : species.databaseDetails.institutionCode },
                                                    { label: lang === 'es' ? 'Colección' : 'Collection', value: species.databaseDetails.collectionName ? `${species.databaseDetails.collectionName} (${species.databaseDetails.collectionCode})` : species.databaseDetails.collectionCode },
                                                    { label: lang === 'es' ? 'Base del Registro' : 'Basis of Record', value: species.databaseDetails.basisOfRecord },
                                                ].filter(item => item.value).map((item, idx) => (
                                                    <tr key={`spec-${idx}`} className={`${idx % 2 !== 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/80 dark:bg-gray-800/40'} hover:bg-accent-green/5 dark:hover:bg-accent-green/10 transition-colors`}>
                                                        <td className="px-6 py-3 font-bold text-gray-400 dark:text-gray-500 uppercase text-[10px] border-b border-gray-100 dark:border-gray-800">{item.label}</td>
                                                        <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800">{item.value || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Section: Distribution */}
                        <section id="distribution" className="scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
                            <SectionHeader
                                title={lang === 'es' ? 'Distribución y Lugar' : 'Distribution & Location'}
                                description={lang === 'es' ? 'Áreas geográficas y contexto de observación.' : 'Geographic ranges and observation context.'}
                            />
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden border border-gray-100 dark:border-gray-800 min-h-[400px] flex flex-col items-center justify-center relative p-2 group">
                                <div className="w-full relative z-10">
                                    <SpeciesDistributionMap
                                        scientificName={species.scientificName}
                                        latitude={species.databaseDetails?.decimalLatitude ?? undefined}
                                        longitude={species.databaseDetails?.decimalLongitude ?? undefined}
                                    />
                                </div>
                                <div className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 mt-2 rounded-xl flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white">{species.location}</h4>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{species.databaseDetails?.country || 'Perú'}</span>
                                            <span className="text-[10px] text-gray-300">•</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{species.databaseDetails?.stateProvince || 'Loreto'}</span>
                                            {species.databaseDetails?.province && (
                                                <>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{species.databaseDetails.province}</span>
                                                </>
                                            )}
                                            {species.databaseDetails?.district && (
                                                <>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{species.databaseDetails.district}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {species.databaseDetails?.ecosystem_name && (
                                        <span className="px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full text-[10px] font-bold text-accent-green whitespace-nowrap">
                                            {species.databaseDetails.ecosystem_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Section: Audios & Analysis */}
                        <section id="audios" className="scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
                            <SectionHeader
                                title={lang === 'es' ? 'Audios' : 'Audios'}
                                description={lang === 'es' ? 'Grabaciones de la especie y su análisis visual.' : 'Recordings of the species and their visual analysis.'}
                            />

                            <AudioListTable
                                audios={species.audios}
                                species={species}
                                lang={lang}
                                onSelect={(idx) => setSelectedAudioIndex(idx)}
                            />

                            {/* Full Analysis Player Modal */}
                            {selectedAudioIndex !== null && (
                                <AudioPlayer
                                    audioUrl={species.audios[selectedAudioIndex].url}
                                    title={species.audios[selectedAudioIndex].title ?? undefined}
                                    artist={commonName}
                                    description={species.audios[selectedAudioIndex].description ?? undefined}
                                    spectrogramImage={species.audios[selectedAudioIndex].spectrogramImage ?? undefined}
                                    spectrogramImages={species.galleryImages?.map(img => img.url).concat(species.spectrograms?.map(img => img.url) || [])}
                                    isModalContainer={true}
                                    onClose={() => setSelectedAudioIndex(null)}
                                    autoplay={true}
                                    species={species}
                                    lang={lang}
                                />
                            )}

                            {/* Spectrograms Gallery */}
                            {species.spectrograms && species.spectrograms.length > 0 && (
                                <div className="pt-12 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <hr className="flex-1 border-gray-100 dark:border-gray-800" />
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-gray-500">Visual Analysis Gallery</h4>
                                        <hr className="flex-1 border-gray-100 dark:border-gray-800" />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                                        <SpeciesGallery images={species.spectrograms.map(img => img.url)} contain />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Section: Ecology / Characteristics */}
                        <section id="characteristics" className="scroll-mt-24 border-t border-gray-100 dark:border-gray-800 pt-16">
                            <SectionHeader
                                title={lang === 'es' ? 'Ecología y Descripción' : 'Ecology & Description'}
                                description={lang === 'es' ? 'Comportamiento y características físicas detalladas.' : 'Detailed behavior and physical characteristics.'}
                            />
                            <div className="prose prose-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-none">
                                <p className="mb-8 p-8 bg-gray-50 dark:bg-gray-900 rounded-sm italic border-l-8 border-accent-green font-medium">
                                    {description}
                                </p>
                                {species.databaseDetails?.occurrenceRemarks && (
                                    <div className="mb-4 p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
                                        <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Observaciones de campo</h5>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                                            "{species.databaseDetails.occurrenceRemarks}"
                                        </p>
                                    </div>
                                )}
                                {species.databaseDetails?.microhabitat_remarks && (
                                    <div className="mb-8 p-6 bg-accent-green/5 border border-accent-green/10 rounded-xl">
                                        <h5 className="text-[10px] font-black text-accent-green uppercase tracking-widest mb-2">Microhábitat</h5>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                                            {species.databaseDetails.microhabitat_remarks}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {characteristics && characteristics.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {characteristics.map((char, idx) => (
                                        <div key={idx} className="flex gap-4 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 items-start group hover:border-accent-green/20 transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent-green mt-2 group-hover:scale-150 transition-transform" />
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{char}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Removed Taxonomy and Details Sections */}

                        {/* CTA / Support Section */}
                        <div className="pt-24 pb-12">
                            <div className="relative overflow-hidden bg-gradient-to-br from-primary-dark to-[#0c141d] rounded-lg p-10 md:p-16 text-white border border-white/5 group">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-accent-green/20 transition-all duration-700"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-green/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                                    <div className="flex-1 space-y-8">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-accent-green border border-accent-green/20">
                                            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
                                            INVESTIGACIÓN Y CONSERVACIÓN
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight">
                                            Ayúdanos a proteger la biodiversidad amazónica
                                        </h3>
                                    </div>
                                    <div className="w-56 h-56 md:w-72 md:h-72 shrink-0 relative animate-float transition-transform duration-700 group-hover:scale-110">
                                        <div className="absolute inset-0 bg-accent-green/20 blur-[60px] rounded-full"></div>
                                        <img src="/images/logo-mini.webp" alt="Support" className="relative z-10 w-full h-full object-contain filter brightness-90 contrast-125" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
