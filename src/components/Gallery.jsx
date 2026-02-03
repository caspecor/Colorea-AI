import './Gallery.css';

function Gallery({ image, isLoading }) {
    if (!image && !isLoading) {
        return (
            <div className="gallery-empty">
                <div className="empty-icon">🎨</div>
                <p>¡Tus dibujos aparecerán aquí!</p>
            </div>
        );
    }

    return (
        <div className="gallery-container">
            {isLoading ? (
                <div className="gallery-loading">
                    <div className="loading-spinner"></div>
                    <p>Los duendes están dibujando...</p>
                </div>
            ) : (
                <div className="gallery-image-wrapper">
                    <img src={image} alt="Dibujo para colorear" className="gallery-image" referrerPolicy="no-referrer" />
                    <div className="print-footer">Colorea AI 🎨</div>
                    <div className="gallery-actions">
                        <button className="action-button print" onClick={() => window.print()}>🖨️ Imprimir</button>
                        <a href={image} download="colorea-ai-dibujo.png" className="action-button download">💾 Guardar</a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Gallery;
