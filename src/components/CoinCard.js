import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCoinDetails } from '../features/coins/coinsSlice';
import { useModal } from '../contexts/ModalContext';
import CoinDetailsModal from './CoinDetailsModal';
const CoinCard = ({ coin, isSelected, onToggle }) => {
    const dispatch = useAppDispatch();
    const details = useAppSelector((state) => state.coins.details[coin.id]);
    const { openModal, isModalOpen, closeModal } = useModal();
    const isDetailsOpen = isModalOpen(`coin-details-${coin.id}`);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleMoreInfo = async () => {
        if (isDetailsOpen) {
            closeModal(`coin-details-${coin.id}`);
            return;
        }
        if (!details) {
            try {
                setLoading(true);
                setError(null);
                await dispatch(fetchCoinDetails(coin.id)).unwrap();
            }
            catch (fetchError) {
                setError('Unable to load additional details right now.');
            }
            finally {
                setLoading(false);
            }
        }
        openModal(`coin-details-${coin.id}`);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("article", { className: `coin-card ${isSelected ? 'coin-card-selected' : ''}`, children: [_jsxs("div", { className: "card-header", children: [_jsxs("div", { className: "coin-meta", children: [_jsx("img", { src: coin.image, alt: `${coin.name} logo` }), _jsxs("div", { children: [_jsx("p", { className: "coin-symbol", children: coin.symbol.toUpperCase() }), _jsx("p", { className: "coin-name", children: coin.name })] })] }), _jsxs("label", { className: "switch-control", children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: onToggle }), _jsx("span", { className: "switch-slider" })] })] }), _jsxs("div", { className: "card-body", children: [_jsxs("p", { children: ["Current price: $", coin.current_price.toLocaleString('en-US')] }), _jsx("button", { className: "more-info-button", onClick: handleMoreInfo, children: isDetailsOpen ? 'Hide details' : 'More Info' })] })] }), _jsx(CoinDetailsModal, { coinId: coin.id, coin: details, loading: loading, error: error })] }));
};
export default CoinCard;
