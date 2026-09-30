const { useState, useEffect } = React;

// -----------------------------------------
// KOMPONEN KARTU
// -----------------------------------------
const Card = ({ item, isFlipped, isMatched, onClick }) => {
    const cardClass = `card ${isFlipped || isMatched ? 'flipped' : ''}`;
    
    return (
        <div className={cardClass} onClick={onClick}>
            <div className="card-back">
                <span>❖</span>
            </div>
            <div className="card-front">
                <span className={item.type === 'aksara' ? 'aksara-text' : 'latin-text'}>
                    {item.content}
                </span>
            </div>
        </div>
    );
};

// -----------------------------------------
// KOMPONEN UTAMA (App)
// -----------------------------------------
const App = () => {
    const [levelsData, setLevelsData] = useState([]);
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [score, setScore] = useState(0);
    const [lockBoard, setLockBoard] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('data.json')
            .then(res => res.json())
            .then(data => {
                setLevelsData(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Gagal memuat JSON:", err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (levelsData.length > 0) {
            setupLevel(currentLevelIndex);
        }
    }, [levelsData, currentLevelIndex]);

    const setupLevel = (index) => {
        const levelData = levelsData[index].pairs;
        let deck = [];
        
        levelData.forEach((item, i) => {
            deck.push({ uniqueId: `${i}A`, id: item.id, content: item.aksara, type: 'aksara', isFlipped: false, isMatched: false });
            deck.push({ uniqueId: `${i}L`, id: item.id, content: item.latin, type: 'latin', isFlipped: false, isMatched: false });
        });

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        setCards(deck);
        setFlippedIndices([]);
        setLockBoard(false);
    };

    const handleCardClick = (index) => {
        if (lockBoard) return;
        if (cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlippedIndices = [...flippedIndices, index];
        setFlippedIndices(newFlippedIndices);

        if (newFlippedIndices.length === 2) {
            setLockBoard(true);
            checkForMatch(newFlippedIndices, newCards);
        }
    };

    const checkForMatch = (indices, currentCards) => {
        const [index1, index2] = indices;
        const isMatch = currentCards[index1].id === currentCards[index2].id;

        if (isMatch) {
            currentCards[index1].isMatched = true;
            currentCards[index2].isMatched = true;
            setScore(prev => prev + 10);
            setCards([...currentCards]);
            setFlippedIndices([]);
            setLockBoard(false);
            
            checkWinCondition(currentCards);
        } else {
            setScore(prev => (prev - 2 < 0 ? 0 : prev - 2));
            setTimeout(() => {
                currentCards[index1].isFlipped = false;
                currentCards[index2].isFlipped = false;
                setCards([...currentCards]);
                setFlippedIndices([]);
                setLockBoard(false);
            }, 1000);
        }
    };

    const checkWinCondition = (currentCards) => {
        const isLevelComplete = currentCards.every(card => card.isMatched);
        if (isLevelComplete) {
            setTimeout(() => {
                alert(`Level ${levelsData[currentLevelIndex].level} Selesai!`);
            }, 500);
        }
    };

    const handleNextLevel = () => {
        if (currentLevelIndex < levelsData.length - 1) {
            setCurrentLevelIndex(prev => prev + 1);
        } else {
            alert(`Semua level telah diselesaikan! Skor akhir: ${score}`);
        }
    };

    if (isLoading) return <div className="app-container">Memuat data...</div>;
    if (levelsData.length === 0) return <div className="app-container">Gagal memuat data.json</div>;

    const currentData = levelsData[currentLevelIndex];
    const isLevelComplete = cards.length > 0 && cards.every(card => card.isMatched);
    const gridColumns = cards.length > 16 ? 6 : 4;

    return (
        <div className="app-container">
            <div className="header">
                <h1>Memori Aksara Jawa</h1>
                <h2>Level {currentData.level} : {currentData.title}</h2>
            </div>
            
            <div className="info-panel">
                <p>Skor: <span>{score}</span></p>
                <div>
                    <button className="btn-primary" onClick={() => setupLevel(currentLevelIndex)}>
                        Ulangi Level
                    </button>
                    {isLevelComplete && currentLevelIndex < levelsData.length - 1 && (
                        <button className="btn-success" onClick={handleNextLevel}>
                            Level Berikutnya
                        </button>
                    )}
                </div>
            </div>

            <div className="game-board" style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
                {cards.map((item, index) => (
                    <Card
                        key={item.uniqueId}
                        item={item}
                        isFlipped={item.isFlipped}
                        isMatched={item.isMatched}
                        onClick={() => handleCardClick(index)}
                    />
                ))}
            </div>

            {/* Bagian Footer Kandangjago */}
            <div className="footer">
                <p>Dari <strong>KANDANGJAGO</strong> untuk Nusantara</p>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
