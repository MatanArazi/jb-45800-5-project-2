import { useState } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';

const ApiKeyModal = () => {
  const { apiKey, setApiKey, isKeySet } = useApiKey();
  const [inputValue, setInputValue] = useState('');
  const [showModal, setShowModal] = useState(!isKeySet);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
      return (
        <div className="api-key-status">
          <button 
            className="api-key-button"
            onClick={handleOpenModal}
            title="Click to change API key"
          >
            🔑 API Key Set
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="modal-overlay" onClick={() => showModal && !isSaved && setShowModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>NVIDIA LLM API Key</h2>
        
        {isSaved ? (
          <div className="api-key-success">
            ✓ API key saved successfully!
          </div>
        ) : (
          <>
            <p>
              Enter your NVIDIA Build API key to enable AI recommendations.
            </p>
            <p className="api-key-hint">
              Get your free API key from{' '}
              <a 
                href="https://build.nvidia.com/models" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                NVIDIA Build
              </a>
            </p>

            <form onSubmit={handleSubmit} className="api-key-form">
              <input
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste your API key here..."
                autoFocus
                className="api-key-input"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="primary-button"
              >
                Save API Key
              </button>
            </form>

            {isKeySet && (
              <button 
                type="button"
                onClick={handleClearKey}
                className="secondary-button"
              >
                Change API Key
              </button>
            )}
          </>
        )}

        {!isSaved && (
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="tertiary-button"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiKeyModal;
