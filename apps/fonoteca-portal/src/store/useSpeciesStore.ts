import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SpeciesState {
    searchTerm: string;
    selectedLocation: string;
    selectedClass: string;
    selectedOrder: string;
    selectedFamily: string;
    selectedGenus: string;
    onlyWithAudio: boolean;
    viewMode: 'grid' | 'list';
    isSidebarCollapsed: boolean;
    page: number;
    setSearchTerm: (s: string) => void;
    setSelectedLocation: (l: string) => void;
    setSelectedClass: (c: string) => void;
    setSelectedOrder: (o: string) => void;
    setSelectedFamily: (f: string) => void;
    setSelectedGenus: (g: string) => void;
    setOnlyWithAudio: (a: boolean) => void;
    setViewMode: (v: 'grid' | 'list') => void;
    setIsSidebarCollapsed: (c: boolean) => void;
    setPage: (p: number) => void;
}

export const useSpeciesStore = create<SpeciesState>()(
    persist(
        (set) => ({
            searchTerm: '',
            selectedLocation: 'All',
            selectedClass: 'All',
            selectedOrder: 'All',
            selectedFamily: 'All',
            selectedGenus: 'All',
            onlyWithAudio: true,
            viewMode: 'grid',
            isSidebarCollapsed: false,
            page: 1,
            setSearchTerm: (searchTerm) => set({ searchTerm, page: 1 }),
            setSelectedLocation: (selectedLocation) => set({ selectedLocation, page: 1 }),
            setSelectedClass: (selectedClass) => set({ selectedClass, selectedOrder: 'All', selectedFamily: 'All', selectedGenus: 'All', page: 1 }),
            setSelectedOrder: (selectedOrder) => set({ selectedOrder, selectedFamily: 'All', selectedGenus: 'All', page: 1 }),
            setSelectedFamily: (selectedFamily) => set({ selectedFamily, selectedGenus: 'All', page: 1 }),
            setSelectedGenus: (selectedGenus) => set({ selectedGenus, page: 1 }),
            setOnlyWithAudio: (onlyWithAudio) => set({ onlyWithAudio, page: 1 }),
            setViewMode: (viewMode) => set({ viewMode }),
            setIsSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
            setPage: (page) => set({ page }),
        }),
        {
            name: 'species-ui-storage',
            partialize: (state) => ({ 
                isSidebarCollapsed: state.isSidebarCollapsed,
                viewMode: state.viewMode
            }),
        }
    )
);
