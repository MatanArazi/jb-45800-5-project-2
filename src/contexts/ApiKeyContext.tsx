import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Default endpoint — works with OpenAI-compatible APIs
export const DEFAULT_LLM_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
export const DEFAULT_LLM_MODEL = 'gpt-3.5-turbo';

interface ApiKeyContextType {
  apiKey: string | null;
  endpoint: string;
  model: string;
  setApiKey: (key: string) => void;
  setEndpoint: (endpoint: string) => void;
  setModel: (model: string) => void;
  clearApiKey: () => void;
  clearEndpoint: () => void;
  clearModel: () => void;
  isKeySet: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEY_STORAGE_KEY = 'llm_api_key';
const API_ENDPOINT_STORAGE_KEY = 'llm_api_endpoint';
const API_MODEL_STORAGE_KEY = 'llm_api_model';

export const ApiKeyProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [endpoint, setEndpointState] = useState<string>(DEFAULT_LLM_ENDPOINT);
  const [model, setModelState] = useState<string>(DEFAULT_LLM_MODEL);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      const storedEndpoint = localStorage.getItem(API_ENDPOINT_STORAGE_KEY);
      const storedModel = localStorage.getItem(API_MODEL_STORAGE_KEY);
      if (storedKey) setApiKeyState(storedKey);
      if (storedEndpoint) setEndpointState(storedEndpoint);
      if (storedModel) setModelState(storedModel);
    } catch (error) {
      console.error('Failed to load LLM credentials from storage:', error);
    }
  }, []);

  const setApiKey = (key: string) => {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      setApiKeyState(key);
    } catch (error) {
      console.error('Failed to save API key to storage:', error);
    }
  };

  const setEndpoint = (value: string) => {
    try {
      const endpointValue = value.trim() || DEFAULT_LLM_ENDPOINT;
      localStorage.setItem(API_ENDPOINT_STORAGE_KEY, endpointValue);
      setEndpointState(endpointValue);
    } catch (error) {
      console.error('Failed to save endpoint to storage:', error);
    }
  };

  const setModel = (value: string) => {
    try {
      const modelValue = value.trim() || DEFAULT_LLM_MODEL;
      localStorage.setItem(API_MODEL_STORAGE_KEY, modelValue);
      setModelState(modelValue);
    } catch (error) {
      console.error('Failed to save model to storage:', error);
    }
  };

  const clearApiKey = () => {
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      setApiKeyState(null);
    } catch (error) {
      console.error('Failed to clear API key from storage:', error);
    }
  };

  const clearEndpoint = () => {
    try {
      localStorage.removeItem(API_ENDPOINT_STORAGE_KEY);
      setEndpointState(DEFAULT_LLM_ENDPOINT);
    } catch (error) {
      console.error('Failed to clear endpoint from storage:', error);
    }
  };

  const clearModel = () => {
    try {
      localStorage.removeItem(API_MODEL_STORAGE_KEY);
      setModelState(DEFAULT_LLM_MODEL);
    } catch (error) {
      console.error('Failed to clear model from storage:', error);
    }
  };

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        endpoint,
        model,
        setApiKey,
        setEndpoint,
        setModel,
        clearApiKey,
        clearEndpoint,
        clearModel,
        isKeySet: apiKey !== null && apiKey.length > 0
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within ApiKeyProvider');
  }
  return context;
};
