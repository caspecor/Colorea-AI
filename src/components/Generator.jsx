import { useState } from 'react';
import './Generator.css';

function Generator({ onGenerate, isLoading, loadingStage }) {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim()) {
            onGenerate(prompt);
        }
    };

    return (
        <div className="generator-container">
            <form onSubmit={handleSubmit} className="generator-form">
                <label htmlFor="prompt-input" className="generator-label">
                    ¿Qué quieres dibujar hoy? 🖍️
                </label>
                <div className="input-group">
                    <input
                        id="prompt-input"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Un dinosaurio espacial..."
                        className="generator-input"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={`generator-button ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading || !prompt.trim()}
                    >
                        {isLoading ? loadingStage || '✨ Creando...' : '✨ ¡Magia!'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Generator;
