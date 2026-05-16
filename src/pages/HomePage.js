import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCoinList, toggleCoinSelection, cancelSelectionSwap, confirmSelectionSwap } from '../features/coins/coinsSlice';
import CoinCard from '../components/CoinCard';
import MaxSelectDialog from '../components/MaxSelectDialog';
const HomePage = () => {
    const dispatch = useAppDispatch();
    const { list, status, error, selection } = useAppSelector((state) => state.coins);
    const filteredCoins = list.filter((coin) => {
        const query = selection.searchQuery.trim().toLowerCase();
        return (coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query));
    });
    useEffect(() => {
        if (status === 'idle' && list.length === 0) {
            dispatch(fetchCoinList());
        }
    }, [dispatch, list.length, status]);
    return (_jsxs("div", { className: "page home-page", children: [_jsx("section", { className: "hero-card", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Cryptonite" }), _jsx("h1", { children: "Realtime Digital Coins" }), _jsx("p", { children: "Display the top 100 coins, select up to 5 for tracking, and get smart reports." })] }) }), _jsxs("section", { className: "home-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Coin cards" }), _jsx("p", { children: "The user can select up to 5 coins using the switch." })] }), _jsx("div", { className: "selection-summary", children: _jsxs("span", { children: ["Selected coins: ", selection.selectedIds.length, " / 5"] }) })] }), status === 'loading' && _jsx("div", { className: "status-message", children: "Loading coins..." }), status === 'failed' && _jsxs("div", { className: "status-error", children: ["Failed to load coins: ", error] }), status === 'idle' && filteredCoins.length === 0 && (_jsx("div", { className: "status-message", children: "No coins matched that search." })), _jsx("div", { className: "coins-grid", children: filteredCoins.map((coin) => (_jsx(CoinCard, { coin: coin, isSelected: selection.selectedIds.includes(coin.id), onToggle: () => dispatch(toggleCoinSelection(coin.id)) }, coin.id))) }), _jsx(MaxSelectDialog, { open: selection.isSelectionDialogOpen, currentSelection: selection.selectedIds, coins: list, pendingSelectionId: selection.pendingSelectionId, onClose: () => dispatch(cancelSelectionSwap()), onConfirm: (removeId) => dispatch(confirmSelectionSwap(removeId)) })] }));
};
export default HomePage;
