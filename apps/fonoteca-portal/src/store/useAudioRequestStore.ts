import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    multimediaId: string;
    title: string;
    scientificName: string;
    vocalizationType: string | null;
    duration: number | null;
}

interface AudioRequestState {
    cartItems: CartItem[];
    isCartOpen: boolean;
    addToCart: (item: CartItem) => void;
    addToCartBulk: (items: CartItem[]) => void;
    removeFromCart: (multimediaId: string) => void;
    clearCart: () => void;
    setIsCartOpen: (open: boolean) => void;
    isInCart: (multimediaId: string) => boolean;
}

export const useAudioRequestStore = create<AudioRequestState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            isCartOpen: false,
            addToCart: (item) => {
                const current = get().cartItems;
                if (!current.some((i) => i.multimediaId === item.multimediaId)) {
                    set({ cartItems: [...current, item] });
                }
            },
            addToCartBulk: (items) => {
                const current = get().cartItems;
                const newItems = items.filter(
                    (item) => !current.some((i) => i.multimediaId === item.multimediaId)
                );
                if (newItems.length > 0) {
                    set({ cartItems: [...current, ...newItems] });
                }
            },
            removeFromCart: (multimediaId) => {
                set({
                    cartItems: get().cartItems.filter((i) => i.multimediaId !== multimediaId),
                });
            },
            clearCart: () => set({ cartItems: [] }),
            setIsCartOpen: (open) => set({ isCartOpen: open }),
            isInCart: (multimediaId) => {
                return get().cartItems.some((i) => i.multimediaId === multimediaId);
            },
        }),
        {
            name: 'scientific-audio-request-cart',
        }
    )
);
