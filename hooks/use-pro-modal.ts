
import {create} from "zustand"

interface useProModalStore {
    isOpen: boolean,
    onOpne: () => void,
    onClose: () => void,
}

export const useProModal = create<useProModalStore>((set) => ({
    isOpen: false,
    onOpne: () => set({isOpen: true}),
    onClose: () => set({isOpen: false})
}))