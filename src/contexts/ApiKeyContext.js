import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
// Default endpoint — works for NVIDIA, OpenAI-compatible, and most chat completions APIs.
export const DEFAULT_LLM_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const ApiKeyContext = createContext(undefined);
const API_KEY_STORAGE_KEY = 'llm_api_key';
const API_ENDPOINT_STORAGE_KEY = 'llm_api_endpoint';
export const ApiKeyProvider = ({ children }) => {
    const [apiKey, setApiKeyState] = useState(null);
    const [endpoint, setEndpointState] = useState(DEFAULT_LLM_ENDPOINT);
    useEffect(() => {
        try {
            const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            const storedEndpoint = localStorage.getItem(API_ENDPOINT_STORAGE_KEY);
            if (storedKey)
                setApiKeyState(storedKey);
            if (storedEndpoint)
                setEndpointState(storedEndpoint);
        }
        catch (error) {
            console.error('Failed to load LLM credentials from storage:', error);
        }
    }, []);
    const setApiKey = (key) => {
        try {
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
            setApiKeyState(key);
        }
        catch (error) {
            console.error('Failed to save API key to storage:', error);
        }
    };
    const setEndpoint = (value) => {
        try {
            const endpointValue = value.trim() || DEFAULT_LLM_ENDPOINT;
            localStorage.setItem(API_ENDPOINT_STORAGE_KEY, endpointValue);
            setEndpointState(endpointValue);
        }
        catch (error) {
            console.error('Failed to save endpoint to storage:', error);
        }
    };
    const clearApiKey = () => {
        try {
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            setApiKeyState(null);
        }
        catch (error) {
            console.error('Failed to clear API key from storage:', error);
        }
    };
    const clearEndpoint = () => {
        try {
            localStorage.removeItem(API_ENDPOINT_STORAGE_KEY);
            setEndpointState(DEFAULT_LLM_ENDPOINT);
        }
        catch (error) {
            console.error('Failed to clear endpoint from storage:', error);
        }
    };
    return (_jsx(ApiKeyContext.Provider, { value: {
            apiKey,
            endpoint,
            setApiKey,
            setEndpoint,
            clearApiKey,
            clearEndpoint,
            isKeySet: apiKey !== null && apiKey.length > 0
        }, children: children }));
};
export const useApiKey = () => {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error('useApiKey must be used within ApiKeyProvider');
    }
    return context;
};
