import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModalId = string;

interface ModalContextType {
  openModals: Set<ModalId>;
  openModal: (id: ModalId) => void;
  closeModal: (id: ModalId) => void;
  closeAllModals: () => void;
  isModalOpen: (id: ModalId) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [openModals, setOpenModals] = useState<Set<ModalId>>(new Set());

  const openModal = (id: ModalId) => {
    setOpenModals((prev) => new Set(prev).add(id));
  };

  const closeModal = (id: ModalId) => {
    setOpenModals((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const closeAllModals = () => {
    setOpenModals(new Set());
  };

  const isModalOpen = (id: ModalId) => {
    return openModals.has(id);
  };

  return (
    <ModalContext.Provider
      value={{
        openModals,
        openModal,
        closeModal,
        closeAllModals,
        isModalOpen
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};
