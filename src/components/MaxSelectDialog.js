import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const MaxSelectDialog = ({ open, currentSelection, coins, pendingSelectionId, onClose, onConfirm }) => {
    if (!open || !pendingSelectionId) {
        return null;
    }
    const selectedCoins = coins.filter((coin) => currentSelection.includes(coin.id));
    const pendingCoin = coins.find((coin) => coin.id === pendingSelectionId);
    return (_jsx("div", { className: "dialog-overlay", onClick: (event) => event.stopPropagation(), children: _jsxs("div", { className: "dialog-window", role: "dialog", "aria-modal": "true", children: [_jsx("h2", { children: "Select a coin to remove" }), _jsxs("p", { children: ["5 coins are already selected. To add ", pendingCoin?.name || 'the new coin', ", please remove one coin first."] }), _jsx("div", { className: "dialog-list", children: selectedCoins.map((coin) => (_jsxs("button", { className: "dialog-option", type: "button", onClick: () => onConfirm(coin.id), children: [coin.name, " (", coin.symbol.toUpperCase(), ")"] }, coin.id))) }), _jsx("button", { className: "secondary-button", type: "button", onClick: onClose, children: "Cancel" })] }) }));
};
export default MaxSelectDialog;
