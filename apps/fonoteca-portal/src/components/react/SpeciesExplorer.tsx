import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    LayoutGrid,
    List,
    ChevronDown,
    X,
    Music,
    MapPin,
    Play,
    Info,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    RefreshCw,
    ArrowRight,
    Pin
} from 'lucide-react';
import type { Species } from '../../data/species';
import { getAllSpecies, getFilterMetaData } from '../../data/species';
import { useSpeciesStore } from '../../store/useSpeciesStore';
import { SpeciesCard } from './SpeciesCard';

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

const FilterListBox: React.FC<FilterListBoxProps> = ({ title, items, value, onChange, lang }) => {
    const [search, setSearch] = useState('');
    const filteredItems = items.filter(i =>
        i.toLowerCase().includes(search.toLowerCase()) || i === 'All'
    );

    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-wider px-1">{title}</h3>
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-1 bg-white dark:bg-[#0c141d]">
                <div className="relative">
                    <Search className="w-3 h-3 absolute left-2 top-1.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={lang === 'es' ? 'Filtrar...' : 'Search...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-xs bg-transparent outline-none border-b border-gray-50 dark:border-gray-800 text-gray-800 dark:text-gray-200"
                    />
                </div>
                <ul className="max-h-32 min-h-[40px] overflow-y-auto mt-1 space-y-0.5 custom-scrollbar">
                    {filteredItems.map(item => (
                        <li key={item}>
                            <button
                                onClick={() => onChange(item)}
                                className={`w-full text-left px-2 py-1 rounded-lg text-[11px] cursor-pointer transition-all ${value === item
                                    ? 'bg-accent-green text-white font-medium'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                {item === 'All' ? (lang === 'es' ? 'Todas' : 'All') : item}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#121b28] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-gray-100/50 dark:hover:bg-gray-800/20 transition-colors"
            >
                <span>{title}</span>
                <ChevronDown className={`w-3.5 h-3.5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div className="p-4 space-y-5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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
        <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] lg:bg-transparent">
            {/* Header for Mobile Sheet */}
            <div className="flex items-center justify-between p-6 lg:hidden border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-accent-green" />
                    <h2 className="font-bold text-lg">Filtros</h2>
                </div>
                <div className="flex items-center gap-2">
                    {isSidebarCollapsed && typeof window !== 'undefined' && window.innerWidth >= 1024 && (
                        <button
                            onClick={() => {
                                setIsSidebarCollapsed(false);
                                setIsMobileSheetOpen(false);
                            }}
                            className="p-2 rounded-full hover:bg-accent-green/10 text-accent-green transition-colors"
                            title="Restaurar posición"
                        >
                            <Pin className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={() => setIsMobileSheetOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4 custom-scrollbar">
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

                <div className="space-y-4 pb-10 lg:pb-0">
                    <CollapsibleSection title={lang === 'es' ? 'Taxonomía' : 'Taxonomy'}>
                        <FilterListBox title="Clase" items={classes} value={selectedClass} onChange={setSelectedClass} lang={lang} />
                        <FilterListBox title="Orden" items={orders} value={selectedOrder} onChange={setSelectedOrder} lang={lang} />
                        <FilterListBox title="Familia" items={families} value={selectedFamily} onChange={setSelectedFamily} lang={lang} />
                        <FilterListBox title="Género" items={genera} value={selectedGenus} onChange={setSelectedGenus} lang={lang} />
                    </CollapsibleSection>

                    <CollapsibleSection title={lang === 'es' ? 'Localidad' : 'Location'}>
                        <div className="grid grid-cols-1 gap-1">
                            {locations.map(loc => (
                                <button
                                    key={loc}
                                    onClick={() => setSelectedLocation(loc)}
                                    className={`px-3 py-2 rounded-xl text-[11px] text-left transition-all ${selectedLocation === loc
                                        ? 'bg-accent-green text-white shadow-accent-green/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                                >
                                    {loc === 'All' ? (lang === 'es' ? 'Todas' : 'All') : loc}
                                </button>
                            ))}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={lang === 'es' ? 'Recursos' : 'Resources'}>
                        <button
                            onClick={() => setOnlyWithAudio(!onlyWithAudio)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] transition-all border ${onlyWithAudio ? 'bg-accent-green/10 border-accent-green/30 text-accent-green font-bold' : 'bg-transparent border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Music className="w-3.5 h-3.5" />
                                <span>{lang === 'es' ? 'Solo con Audio' : 'With Audio Only'}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${onlyWithAudio ? 'bg-accent-green border-accent-green' : 'border-gray-300'}`}>
                                {onlyWithAudio && <X className="w-3 h-3 text-white" />}
                            </div>
                        </button>
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[800px]">
            {/* Mobile/Sheet component */}
            <AnimatePresence>
                {isMobileSheetOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSheetOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:bg-black/40"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-[#0f172a] z-[101]"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (Togglable) */}
            <aside className={`hidden lg:block sticky top-24 h-fit transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-0 opacity-0 -translate-x-10 pointer-events-none' : 'w-[280px] opacity-100 translate-x-0'}`}>
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
                {/* Header Control Bar */}
                <div className="bg-white dark:bg-[#121b28] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-1.5 p-1 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {(isSidebarCollapsed || (typeof window !== 'undefined' && window.innerWidth < 1024)) && (
                                <button
                                    onClick={() => setIsMobileSheetOpen(true)}
                                    className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-accent-green transition-all"
                                    title={lang === 'es' ? "Abrir filtros" : "Open filters"}
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                            )}
                            {typeof window !== 'undefined' && window.innerWidth >= 1024 && (
                                <button
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className={`p-2.5 rounded-xl transition-all ${!isSidebarCollapsed ? 'bg-white dark:bg-gray-800 text-accent-green shadow-sm' : 'text-gray-500 hover:text-accent-green'}`}
                                    title={isSidebarCollapsed ? "Restaurar panel fijo" : "Contraer panel"}
                                >
                                    {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
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
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-accent-green outline-none text-sm transition-shadow"
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

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                                    ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isSidebarCollapsed ? 'xl:grid-cols-5' : 'xl:grid-cols-4'} gap-6`
                                    : "flex flex-col gap-4"
                                }
                            >
                                {species.length > 0 ? (
                                    species.map(s => (
                                        <SpeciesCard
                                            key={s.id}
                                            species={s}
                                            viewMode={viewMode}
                                            lang={lang}
                                        />
                                    ))
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
                            <div className="mt-12 flex justify-center items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30 disabled:hover:bg-white transition-all hover:bg-gray-50"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex gap-1.5 px-4">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${page === i + 1 ? 'bg-accent-green text-white scale-110' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 disabled:opacity-30 disabled:hover:bg-white transition-all hover:bg-gray-50"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
