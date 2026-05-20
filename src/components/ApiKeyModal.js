import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
const ApiKeyModal = () => {
    const { apiKey, setApiKey, isKeySet } = useApiKey();
    const [inputValue, setInputValue] = useState('');
    const [showModal, setShowModal] = useState(!isKeySet);
    const [isSaved, setIsSaved] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setApiKey(inputValue.trim());
            setIsSaved(true);
            setInputValue('');
            setTimeout(() => {
                setShowModal(false);
                setIsSaved(false);
            }, 1500);
        }
    };
    const handleOpenModal = () => {
        setShowModal(true);
    };
    const handleClearKey = () => {
        if (window.confirm('Are you sure you want to remove the saved API key?')) {
            setInputValue('');
            setShowModal(true);
        }
    };
    if (!showModal) {
        if (isKeySet) {
            return (_jsx("div", { className: "api-key-status", children: _jsx("button", { className: "api-key-button", onClick: handleOpenModal, title: "Click to change API key", children: "\uD83D\uDD11 API Key Set" }) }));
        }
        return null;
    }
    return (_jsx("div", { className: "modal-overlay", onClick: () => showModal && !isSaved && setShowModal(false), children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsx("h2", { children: "NVIDIA LLM API Key" }), isSaved ? (_jsx("div", { className: "api-key-success", children: "\u2713 API key saved successfully!" })) : (_jsxs(_Fragment, { children: [_jsx("p", { children: "Enter your NVIDIA Build API key to enable AI recommendations." }), _jsxs("p", { className: "api-key-hint", children: ["Get your free API key from", ' ', _jsx("a", { href: "https://build.nvidia.com/models", target: "_blank", rel: "noopener noreferrer", children: "NVIDIA Build" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "api-key-form", children: [_jsx("input", { type: "password", value: inputValue, onChange: (e) => setInputValue(e.target.value), placeholder: "Paste your API key here...", autoFocus: true, className: "api-key-input" }), _jsx("button", { type: "submit", disabled: !inputValue.trim(), className: "primary-button", children: "Save API Key" })] }), isKeySet && (_jsx("button", { type: "button", onClick: handleClearKey, className: "secondary-button", children: "Change API Key" }))] })), !isSaved && (_jsx("button", { type: "button", onClick: () => setShowModal(false), className: "tertiary-button", children: "Close" }))] }) }));
};
export default ApiKeyModal;
