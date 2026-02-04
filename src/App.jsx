import { useState } from 'react'
import './App.css'
import Generator from './components/Generator'
import Gallery from './components/Gallery'
import History from './components/History'


function App() {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('colorea-history');
    return saved ? JSON.parse(saved) : [];
  });

  const addToHistory = (url, prompt) => {
    const newItem = { url, prompt, date: new Date().toISOString() };
    const newHistory = [newItem, ...history];
    setHistory(newHistory);
    localStorage.setItem('colorea-history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (confirm('¿Seguro que quieres borrar todos tus dibujos guardados?')) {
      setHistory([]);
      localStorage.removeItem('colorea-history');
    }
  };

  const removeFromHistory = (indexToRemove) => {
    const newHistory = history.filter((_, index) => index !== indexToRemove);
    setHistory(newHistory);
    localStorage.setItem('colorea-history', JSON.stringify(newHistory));
  };

  const translatePrompt = (text) => {
    const lowerText = text.toLowerCase();
    let translated = text;
    const mappings = {
      'nave': ' spaceship', 'espacial': ' space sci-fi', 'cohete': ' rocket',
      'coche': ' car', 'auto': ' car', 'avión': ' airplane', 'barco': ' boat',
      'gato': ' cat', 'gatito': ' kitten', 'perro': ' dog', 'perrito': ' puppy',
      'pez': ' fish', 'ballena': ' whale', 'delfín': ' dolphin', 'tiburón': ' shark',
      'león': ' lion', 'tigre': ' tiger', 'elefante': ' elephant', 'jirafa': ' giraffe',
      'caballo': ' horse', 'vaca': ' cow', 'oveja': ' sheep', 'conejo': ' rabbit',
      'dragón': ' dragon', 'unicornio': ' unicorn', 'sirena': ' mermaid',
      'hada': ' fairy', 'bruja': ' witch', 'mago': ' wizard', 'fantasma': ' ghost',
      'monstruo': ' monster', 'robot': ' robot', 'superhéroe': ' superhero',
      'princesa': ' princess', 'castillo': ' castle', 'flor': ' flower',
      'árbol': ' tree', 'sol': ' sun', 'luna': ' moon', 'estrella': ' star'
    };
    Object.keys(mappings).forEach(key => {
      if (lowerText.includes(key)) translated += mappings[key];
    });
    return translated;
  };

  // --- LOGICA DE GENERACIÓN ROBUSTA (DAISY CHAIN) ---

  const handleGenerate = async (prompt) => {
    setIsLoading(true);
    setGeneratedImage(null);

    const englishPrompt = translatePrompt(prompt);

    // Prompts base por estilo
    const basePrompt = `${englishPrompt}, coloring book page, line art, black and white, clean lines, white background, no shading, minimal detail, cute, for kids`;
    const encodedPrompt = encodeURIComponent(basePrompt);
    const randomSeed = Math.floor(Math.random() * 1000);
    const API_KEY = "pk_cMYlf55YuDABkZZY";

    // Definimos las estrategias en orden de prioridad
    const strategies = [
      {
        name: "Pollinations Turbo (Primary)",
        type: "direct",
        url: `https://image.pollinations.ai/prompt/${encodedPrompt}?model=turbo&seed=${randomSeed}&width=1024&height=1024&nologo=true&key=${API_KEY}`
      },
      {
        name: "Pollinations Flux (Secondary)",
        type: "direct",
        url: `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&seed=${randomSeed}&width=1024&height=1024&nologo=true&key=${API_KEY}`
      },
      {
        name: "Hercai (Backup)",
        type: "async_json",
        // Usamos corsproxy para acceder a Hercai desde el navegador
        endpoint: `https://corsproxy.io/?${encodeURIComponent(`https://hercai.onrender.com/v3/text2image?prompt=${encodedPrompt}`)}`
      }
    ];

    // Función recursiva para probar estrategias una a una
    const tryStrategy = async (index) => {
      if (index >= strategies.length) {
        setIsLoading(false);
        alert("¡Lo siento! Todos los servidores de dibujo están durmiendo ahora mismo. Inténtalo en 5 minutos. 😴");
        return;
      }

      const strategy = strategies[index];
      console.log(`Intentando estrategia ${index + 1}: ${strategy.name}...`);

      try {
        let imageUrlToLoad;

        if (strategy.type === "async_json") {
          // Caso especial para Hercai que requiere Fetch primero
          const response = await fetch(strategy.endpoint);
          const data = await response.json();
          if (data && data.url) {
            imageUrlToLoad = data.url;
          } else {
            throw new Error("No URL in JSON response");
          }
        } else {
          // Caso Directo (Pollinations)
          imageUrlToLoad = strategy.url;
        }

        // Intentamos cargar la imagen "físicamente"
        const img = new Image();
        img.referrerPolicy = "no-referrer";

        img.onload = () => {
          console.log(`¡Éxito con ${strategy.name}!`);
          setGeneratedImage(imageUrlToLoad);
          addToHistory(imageUrlToLoad, prompt);
          setIsLoading(false);
        };

        img.onerror = (err) => {
          console.warn(`Fallo en ${strategy.name}. Pasando al siguiente...`);
          // Si falla, llamamos recursivamente a la siguiente estrategia
          tryStrategy(index + 1);
        };

        img.src = imageUrlToLoad;

      } catch (error) {
        console.warn(`Error técnico en ${strategy.name}:`, error);
        tryStrategy(index + 1);
      }
    };

    // Iniciamos la cadena
    tryStrategy(0);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Colorea AI 🎨</h1>
        <p>¡Crea dibujos mágicos para colorear!</p>
      </header>

      <div className={`content-wrapper ${history.length === 0 ? 'centered' : ''}`}>
        <main className="app-main">
          <Generator onGenerate={handleGenerate} isLoading={isLoading} />
          <Gallery image={generatedImage} isLoading={isLoading} />
        </main>

        <aside className="app-sidebar">
          <History
            history={history}
            onSelect={(item) => setGeneratedImage(item.url)}
            onClear={clearHistory}
            onRemove={removeFromHistory}
          />
        </aside>
      </div>

      <footer className="app-footer">
        <p>Hecho con 💖 para pequeños artistas</p>
      </footer>
    </div>
  )
}

export default App
