import './History.css';

function History({ history, onSelect, onClear, onRemove }) {
    if (history.length === 0) return null;

    return (
        <div className="history-container">
            <div className="history-header">
                <h3>Mis Dibujos 📚</h3>
                <button onClick={onClear} className="clear-history-btn" title="Borrar todo">
                    🗑️ Todo
                </button>
            </div>
            <div className="history-grid">
                {history.map((item, index) => (
                    <div
                        key={index}
                        className="history-item"
                        onClick={() => onSelect(item)}
                    >
                        <img src={item.url} alt={`Dibujo ${index + 1}`} />
                        <button
                            className="delete-item-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(index);
                            }}
                            title="Borrar este dibujo"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default History;
