import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const ModalContext = createContext(undefined);
export const ModalProvider = ({ children }) => {
    const [openModals, setOpenModals] = useState(new Set());
    const openModal = (id) => {
        setOpenModals((prev) => new Set(prev).add(id));
    };
    const closeModal = (id) => {
        setOpenModals((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };
    const closeAllModals = () => {
        setOpenModals(new Set());
    };
    const isModalOpen = (id) => {
        return openModals.has(id);
    };
    return (_jsx(ModalContext.Provider, { value: {
            openModals,
            openModal,
            closeModal,
            closeAllModals,
            isModalOpen
        }, children: children }));
};
export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within ModalProvider');
    }
    return context;
};
