import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import {
    Search,
    Filter,
    LayoutGrid,
    List,
    ChevronDown,
    X,
    Music,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    RefreshCw,
} from 'lucide-react';
import type { Species } from '../../data/species';
import { getAllSpecies, getFilterMetaData } from '../../data/species';
import { useSpeciesStore } from '../../store/useSpeciesStore';
import { SpeciesCard, SpeciesTableRow } from './SpeciesCard';

interface SpeciesExplorerProps {
    initialData: { species: Species[], totalCount: number };
    lang: 'es' | 'en' | 'pt';
}

interface FilterListBoxProps {
    title: string;
    items: string[];
    value: string;
    onChange: (val: string) => void;
    lang: string;
}

const FilterCombobox: React.FC<{
    title: string;
    items: string[];
    value: string;
    onChange: (val: string) => void;
    lang: string;
    disabled?: boolean;
}> = ({ title, items, value, onChange, lang, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() =>
        items.filter(item =>
            item.toLowerCase().includes(search.toLowerCase()) || item === 'All'
        ), [items, search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-1.5 mb-4 relative" ref={containerRef}>
            <label className="text-[11px] font-bold text-[#0c141d] dark:text-gray-300 px-0.5">
                {title}
            </label>

            <div
                className={cn(
                    "relative group transition-all",
                    disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className={cn(
                    "w-full flex items-center justify-between bg-white dark:bg-[#0c141d] border rounded-lg py-2 px-3 text-xs transition-all",
                    isOpen ? "border-accent-green ring-1 ring-accent-green/20" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                )}>
                    <span className={cn("truncate", value === 'All' ? "text-gray-400" : "text-[#0c141d] dark:text-gray-100 font-medium")}>
                        {value === 'All' ? (lang === 'es' ? 'Todos' : 'All') : value}
                    </span>
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#121b28] border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="p-2 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2 bg-gray-50/30 dark:bg-gray-900/30">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={lang === 'es' ? 'Buscar...' : 'Search...'}
                                className="flex-1 bg-transparent border-none outline-none text-[11px] py-1 text-gray-700 dark:text-gray-300"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar">
                            {filteredItems.length > 0 ? (
                                filteredItems.map(item => (
                                    <button
                                        key={item}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(item);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all",
                                            value === item
                                                ? "bg-accent-green/10 text-accent-green font-bold"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        {item === 'All' ? (lang === 'es' ? 'Todos' : 'All') : item}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-6 text-[11px] text-gray-400 text-center">
                                    {lang === 'es' ? 'No hay resultados' : 'No results found'}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 px-1">
            {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// Removed QueryProvider - using direct state management with Supabase

export const SpeciesExplorer: React.FC<SpeciesExplorerProps> = (props) => {
    return (
        <SpeciesExplorerContent {...props} />
    );
};

const SpeciesExplorerContent: React.FC<SpeciesExplorerProps> = ({ initialData, lang }) => {
    const {
        searchTerm, setSearchTerm,
        selectedLocation, setSelectedLocation,
        selectedClass, setSelectedClass,
        selectedOrder, setSelectedOrder,
        selectedFamily, setSelectedFamily,
        selectedGenus, setSelectedGenus,
        onlyWithAudio, setOnlyWithAudio,
        viewMode, setViewMode,
        isSidebarCollapsed, setIsSidebarCollapsed,
        page, setPage
    } = useSpeciesStore();

    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [searchInput, setSearchInput] = useState(searchTerm);
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [filterMeta, setFilterMeta] = useState<{
        classes: string[], orders: string[], families: string[], genera: string[], localities: string[]
    } | null>(null);

    // 1. URL Synchronization on mount
    useEffect(() => {
        setIsHydrated(true);
        const params = new URLSearchParams(window.location.search);

        if (params.has('q')) {
            const q = params.get('q') || '';
            setSearchTerm(q);
            setSearchInput(q);
        }
        if (params.has('loc')) setSelectedLocation(params.get('loc') || 'All');
        if (params.has('class')) setSelectedClass(params.get('class') || 'All');
        if (params.has('order')) setSelectedOrder(params.get('order') || 'All');
        if (params.has('family')) setSelectedFamily(params.get('family') || 'All');
        if (params.has('genus')) setSelectedGenus(params.get('genus') || 'All');
        if (params.has('audio')) setOnlyWithAudio(params.get('audio') === 'true');
        if (params.has('page')) setPage(parseInt(params.get('page') || '1'));
    }, []);

    // 2. Search Debounce
    useEffect(() => {
        if (!isHydrated) return;
        const timer = setTimeout(() => {
            if (searchTerm !== searchInput) {
                setSearchTerm(searchInput);
                setPage(1);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [searchInput, isHydrated, searchTerm, setSearchTerm, setPage]);

    // 3. Direct Fetch function (Replacting useQuery)
    const fetchData = async (isRefetch = false) => {
        if (!isRefetch) setIsLoading(true);
        setIsFetching(true);
        try {
            const result = await getAllSpecies({
                searchTerm,
                location: selectedLocation,
                className: selectedClass,
                order: selectedOrder,
                family: selectedFamily,
                genus: selectedGenus,
                onlyWithAudio,
                page,
                limit: 20
            });
            setData(result);
        } catch (error) {
            console.error("Error fetching species:", error);
        } finally {
            setIsLoading(false);
            setIsFetching(false);
        }
    };

    // 4. Fetch MetaData and Main Data
    useEffect(() => {
        if (!isHydrated) return;
        fetchData();
    }, [isHydrated, searchTerm, selectedLocation, selectedClass, selectedOrder, selectedFamily, selectedGenus, onlyWithAudio, page]);

    useEffect(() => {
        if (!isHydrated) return;
        const fetchMeta = async () => {
            const meta = await getFilterMetaData();
            setFilterMeta(meta);
        };
        fetchMeta();
    }, [isHydrated]);

    const species = data?.species || [];
    const totalCount = data?.totalCount || 0;
    const ITEMS_PER_PAGE = 20;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // 5. URL Update on state change
    useEffect(() => {
        if (!isHydrated) return;

        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (selectedLocation !== 'All') params.set('loc', selectedLocation);
        if (selectedClass !== 'All') params.set('class', selectedClass);
        if (selectedOrder !== 'All') params.set('order', selectedOrder);
        if (selectedFamily !== 'All') params.set('family', selectedFamily);
        if (selectedGenus !== 'All') params.set('genus', selectedGenus);
        if (onlyWithAudio) params.set('audio', 'true');
        if (page > 1) params.set('page', page.toString());

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
    }, [
        searchTerm, selectedLocation,
        selectedClass, selectedOrder, selectedFamily,
        selectedGenus, onlyWithAudio, page, isHydrated
    ]);

    // Dynamic Lists for filters (from metadata)
    const locations = useMemo(() => ['All', ...(filterMeta?.localities || [])], [filterMeta]);
    const classes = useMemo(() => ['All', ...(filterMeta?.classes || [])], [filterMeta]);
    const orders = useMemo(() => ['All', ...(filterMeta?.orders || [])], [filterMeta]);
    const families = useMemo(() => ['All', ...(filterMeta?.families || [])], [filterMeta]);
    const genera = useMemo(() => ['All', ...(filterMeta?.genera || [])], [filterMeta]);

    const playAudio = (species: Species) => {
        // Handled directly inside SpeciesCard via custom events to trigger PersistentPlayer
    };

    const categoryTitles: Record<string, string> = {
        Amphibians: lang === 'es' ? 'Anfibios' : lang === 'pt' ? 'Anfíbios' : 'Amphibians',
        Birds: lang === 'es' ? 'Aves' : 'Birds',
        Crickets: lang === 'es' ? 'Grillos' : lang === 'pt' ? 'Grilos' : 'Crickets',
        Mammals: lang === 'es' ? 'Mamíferos' : lang === 'pt' ? 'Mamíferos' : 'Mammals',
        Reptiles: 'Reptiles'
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearchTerm('');
        setSelectedLocation('All');
        setSelectedClass('All');
        setSelectedOrder('All');
        setSelectedFamily('All');
        setSelectedGenus('All');
        setOnlyWithAudio(false);
        setPage(1);
    };

    if (!isHydrated) return null;

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white dark:bg-[#121b28]">
            {/* Header for Mobile Sheet & Desktop */}
            <div className="flex items-center justify-between p-4 lg:p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent-green" />
                    <h2 className="font-bold text-xs uppercase tracking-wider">{lang === 'es' ? 'Filtros' : 'Filters'}</h2>
                </div>
                <div className="flex items-center gap-2">
                    {/* Desktop Close Button */}
                    <button
                        onClick={() => setIsSidebarCollapsed(true)}
                        className="hidden lg:flex p-1.5 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-500 transition-colors"
                        title={lang === 'es' ? 'Contraer panel' : 'Collapse panel'}
                    >
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                    {/* Mobile Close Button */}
                    <button onClick={() => setIsMobileSheetOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Active Filters Summary */}
                {(selectedLocation !== 'All' || selectedClass !== 'All' || selectedOrder !== 'All' || selectedFamily !== 'All' || selectedGenus !== 'All' || onlyWithAudio || searchTerm) && (
                    <div className="mb-4 p-4 rounded-2xl bg-accent-green/5 border border-accent-green/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest">Activos</span>
                            <button onClick={clearFilters} className="text-[10px] text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
                                <X className="w-2.5 h-2.5" />
                                {lang === 'es' ? 'Limpiar' : 'Clear'}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {searchTerm && (
                                <div className="px-2 py-0.5 bg-white dark:bg-gray-800 text-[10px] rounded-md border border-gray-100 dark:border-gray-700 flex items-center gap-1">
                                    <span className="max-w-[70px] truncate text-gray-700 dark:text-gray-300">"{searchTerm}"</span>
                                    <X className="w-2.5 h-2.5 cursor-pointer text-gray-400 hover:text-red-500" onClick={() => { setSearchInput(''); setSearchTerm(''); }} />
                                </div>
                            )}
                            {selectedClass !== 'All' && (
                                <div className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] rounded-md border border-accent-green/20 flex items-center gap-1">
                                    <span>{selectedClass}</span>
                                    <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" onClick={() => setSelectedClass('All')} />
                                </div>
                            )}
                            {selectedOrder !== 'All' && (
                                <div className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] rounded-md border border-accent-green/20 flex items-center gap-1">
                                    <span>{selectedOrder}</span>
                                    <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" onClick={() => setSelectedOrder('All')} />
                                </div>
                            )}
                            {selectedFamily !== 'All' && (
                                <div className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] rounded-md border border-accent-green/20 flex items-center gap-1">
                                    <span>{selectedFamily}</span>
                                    <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" onClick={() => setSelectedFamily('All')} />
                                </div>
                            )}
                            {selectedGenus !== 'All' && (
                                <div className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] rounded-md border border-accent-green/20 flex items-center gap-1">
                                    <span>{selectedGenus}</span>
                                    <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" onClick={() => setSelectedGenus('All')} />
                                </div>
                            )}
                            {selectedLocation !== 'All' && (
                                <div className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] rounded-md border border-accent-green/20 flex items-center gap-1">
                                    <span>{selectedLocation}</span>
                                    <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" onClick={() => setSelectedLocation('All')} />
                                </div>
                            )}
                            {onlyWithAudio && (
                                <div className="px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] rounded-md border border-accent-green/20 flex items-center gap-1">
                                    <Music className="w-2.5 h-2.5" />
                                    <span>Audio</span>
                                    <X className="w-2.5 h-2.5 cursor-pointer hover:text-red-500" onClick={() => setOnlyWithAudio(false)} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-8 pb-10 lg:pb-0">
                    <SidebarSection title={lang === 'es' ? 'Taxonomía' : 'Taxonomy'}>
                        <div className="space-y-1">
                            <FilterCombobox title="Clase" items={classes} value={selectedClass} onChange={setSelectedClass} lang={lang} />
                            <FilterCombobox title="Orden" items={orders} value={selectedOrder} onChange={setSelectedOrder} lang={lang} disabled={selectedClass === 'All'} />
                            <FilterCombobox title="Familia" items={families} value={selectedFamily} onChange={setSelectedFamily} lang={lang} disabled={selectedOrder === 'All' || selectedClass === 'All'} />
                            <FilterCombobox title="Género" items={genera} value={selectedGenus} onChange={setSelectedGenus} lang={lang} disabled={selectedFamily === 'All' || selectedOrder === 'All' || selectedClass === 'All'} />
                        </div>
                    </SidebarSection>

                    <SidebarSection title={lang === 'es' ? 'Localidad' : 'Location'}>
                        <FilterCombobox title="Localidad" items={locations} value={selectedLocation} onChange={setSelectedLocation} lang={lang} />
                    </SidebarSection>

                    <SidebarSection title={lang === 'es' ? 'Recursos' : 'Resources'}>
                        <button
                            onClick={() => setOnlyWithAudio(!onlyWithAudio)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] transition-all border ${onlyWithAudio ? 'bg-accent-green/10 border-accent-green/30 text-accent-green font-bold' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Music className="w-3.5 h-3.5" />
                                <span>{lang === 'es' ? 'Solo con Audio' : 'With Audio Only'}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${onlyWithAudio ? 'bg-accent-green border-accent-green' : 'border-gray-300'}`}>
                                {onlyWithAudio && <X className="w-3 h-3 text-white" />}
                            </div>
                        </button>
                    </SidebarSection>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-[800px] w-full">
            {/* Mobile/Sheet component */}
            <AnimatePresence>
                {isMobileSheetOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSheetOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-[#0f172a] z-[101] lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (Admin Panel Style) */}
            <aside className={`hidden lg:flex flex-col sticky top-24 h-[calc(100vh-6rem)] transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121b28] overflow-hidden rounded-none shadow-none ${isSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none border-none' : 'w-[280px] opacity-100 flex-shrink-0'}`}>
                <div className="w-[280px] h-full flex flex-col">
                    <SidebarContent />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 transition-all duration-300 flex flex-col">
                {/* Header Control Bar */}
                <div className="sticky top-[64px] lg:top-20 z-40 bg-white/95 dark:bg-[#121b28]/95 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between transition-all rounded-none shadow-none w-full">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-1.5 p-1 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {/* Mobile Filter Button */}
                            <button
                                onClick={() => setIsMobileSheetOpen(true)}
                                className="lg:hidden p-2.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-accent-green transition-all"
                                title={lang === 'es' ? "Abrir filtros" : "Open filters"}
                            >
                                <Filter className="w-5 h-5" />
                            </button>

                            {/* Desktop Filter Toggle Button (only shows when collapsed) */}
                            {isSidebarCollapsed && (
                                <button
                                    onClick={() => setIsSidebarCollapsed(false)}
                                    className="hidden lg:flex p-2.5 rounded-xl bg-white dark:bg-gray-800 text-accent-green shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                    title={lang === 'es' ? "Mostrar panel de filtros" : "Show filters panel"}
                                >
                                    <PanelLeftOpen className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="relative flex-1 md:w-80">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={lang === 'es' ? 'Buscar especies...' : 'Search species...'}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-accent-green outline-none text-sm transition-shadow"
                            />
                            {searchInput && (
                                <button onClick={() => { setSearchInput(''); setSearchTerm(''); }} className="absolute right-3 top-2.5 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => fetchData(true)}
                            className={`p-2.5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${(isFetching || isLoading) ? 'animate-spin text-accent-green' : 'text-gray-500'}`}
                            disabled={isLoading || isFetching}
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-4">
                        <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-accent-green' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-accent-green' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        <span className="text-xs font-bold text-gray-400 whitespace-nowrap px-2">
                            {totalCount} {lang === 'es' ? 'especies' : 'species'}
                        </span>
                    </div>
                </div>

                <div className="p-4 lg:p-6 space-y-6 flex-1">
                    {/* Loading State */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="bg-white dark:bg-[#121b28] rounded-3xl h-[350px] animate-pulse border border-gray-100 dark:border-gray-800" />
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            {isFetching && (
                                <div className="absolute top-0 right-0 z-10 p-2">
                                    <RefreshCw className="w-4 h-4 text-accent-green animate-spin" />
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={viewMode}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className={viewMode === 'grid'
                                        ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isSidebarCollapsed ? 'xl:grid-cols-6' : 'xl:grid-cols-5'} gap-4 container mx-auto pb-4`
                                        : "w-full overflow-hidden container mx-auto pb-4"
                                    }
                                >
                                    {species.length > 0 ? (
                                        viewMode === 'list' ? (
                                            <div className="w-full overflow-x-auto bg-white dark:bg-[#121b28] border border-gray-100 dark:border-gray-800">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                                            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">Img</th>
                                                            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'es' ? 'Nombre Científico' : 'Scientific Name'}</th>
                                                            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'es' ? 'Nombre Común' : 'Common Name'}</th>
                                                            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Familia</th>
                                                            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Localidad</th>
                                                            <th className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {species.map(s => (
                                                            <SpeciesTableRow
                                                                key={s.id}
                                                                species={s}
                                                                lang={lang}
                                                            />
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            species.map(s => (
                                                <SpeciesCard
                                                    key={s.id}
                                                    species={s}
                                                    viewMode={viewMode}
                                                    lang={lang}
                                                />
                                            ))
                                        )
                                    ) : (
                                        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center">
                                                <Search className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl">{lang === 'es' ? 'No se encontraron especies' : 'No species found'}</h3>
                                                <p className="text-gray-500 max-w-xs">{lang === 'es' ? 'Intenta con otros filtros o términos de búsqueda.' : 'Try adjusting your filters or search terms.'}</p>
                                            </div>
                                            <button onClick={clearFilters} className="text-accent-green font-bold hover:underline">
                                                {lang === 'es' ? 'Limpiar filtros' : 'Clear filters'}
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex flex-wrap justify-end items-center gap-4 text-sm text-gray-700 dark:text-gray-300 pb-8 container mx-auto">
                                    <div>
                                        {lang === 'es' ? 'Mostrando' : 'Showing'} {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, totalCount)} {lang === 'es' ? 'de' : 'of'} {totalCount} {lang === 'es' ? 'resultados' : 'results'} ({lang === 'es' ? 'Página' : 'Page'} {page} {lang === 'es' ? 'de' : 'of'} {totalPages})
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span>{lang === 'es' ? 'Filas por página' : 'Rows per page'}</span>
                                            <select className="border border-gray-200 dark:border-gray-700 rounded-md bg-transparent px-2 py-1 outline-none text-gray-700 dark:text-gray-300">
                                                <option value="20">20</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={page === 1}
                                                onClick={() => setPage(page - 1)}
                                                className="p-1.5 rounded-md bg-[#fbfbf9] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 transition-all hover:bg-gray-100"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="font-medium px-2">{page} / {totalPages}</span>
                                            <button
                                                disabled={page === totalPages}
                                                onClick={() => setPage(page + 1)}
                                                className="p-1.5 rounded-md bg-[#fbfbf9] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 transition-all hover:bg-gray-100"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
