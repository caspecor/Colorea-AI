import { useState } from 'react'
import './App.css'
import Generator from './components/Generator'
import Gallery from './components/Gallery'
import History from './components/History'


function App() {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
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
      // Vehículos
      'nave': ' spaceship', 'espacial': ' space sci-fi', 'cohete': ' rocket',
      'coche': ' car', 'carro': ' car', 'auto': ' car', 'avión': ' airplane',
      'avion': ' airplane', 'helicóptero': ' helicopter', 'barco': ' boat',
      'tren': ' train', 'camión': ' truck', 'moto': ' motorcycle', 'bici': ' bicycle',

      // Animales
      'gato': ' cat', 'gatito': ' kitten', 'perro': ' dog', 'perrito': ' puppy',
      'pez': ' fish', 'peces': ' fish', 'ballena': ' whale', 'delfín': ' dolphin',
      'tiburón': ' shark', 'león': ' lion', 'tigre': ' tiger', 'elefante': ' elephant',
      'jirafa': ' giraffe', 'mono': ' monkey', 'oso': ' bear', 'panda': ' panda',
      'caballo': ' horse', 'vaca': ' cow', 'oveja': ' sheep', 'conejo': ' rabbit',
      'pájaro': ' bird', 'pajaro': ' bird', 'mariposa': ' butterfly', 'abeja': ' bee',

      // Fantasía
      'dragón': ' dragon', 'dragon': ' dragon', 'unicornio': ' unicorn', 'pegaso': ' pegasus',
      'sirena': ' mermaid', 'hada': ' fairy', 'bruja': ' witch', 'mago': ' wizard',
      'fantasma': ' ghost', 'monstruo': ' monster', 'robot': ' robot', 'alien': ' alien',
      'superhéroe': ' superhero', 'superheroe': ' superhero', 'princesa': ' princess',
      'príncipe': ' prince', 'principe': ' prince', 'rey': ' king', 'reina': ' queen',
      'castillo': ' castle',

      // Naturaleza
      'flor': ' flower', 'rosa': ' rose', 'girasol': ' sunflower', 'árbol': ' tree',
      'arbol': ' tree', 'bosque': ' forest', 'selva': ' jungle', 'montaña': ' mountain',
      'sol': ' sun', 'luna': ' moon', 'estrella': ' star', 'nube': ' cloud',
      'arcoíris': ' rainbow', 'arcoiris': ' rainbow', 'fuego': ' fire', 'playa': ' beach',

      // Comida / Otros
      'manzana': ' apple', 'plátano': ' banana', 'fresa': ' strawberry',
      'helado': ' ice cream', 'pastel': ' cake', 'tarta': ' cake', 'pizza': ' pizza',
      'hamburguesa': ' burger', 'pelota': ' ball', 'balón': ' ball', 'juguete': ' toy'
    };
    Object.keys(mappings).forEach(key => {
      if (lowerText.includes(key)) translated += mappings[key];
    });
    return translated;
  };

  const handleGenerate = async (prompt) => {
    setIsLoading(true);
    setLoadingStage('Conectando con el servidor principal...');
    setGeneratedImage(null);

    const englishPrompt = translatePrompt(prompt);
    const basePrompt = `${englishPrompt}, coloring book page, line art, black and white, clean lines, white background, no shading, minimal detail, cute, for kids`;
    const encodedPrompt = encodeURIComponent(basePrompt);
    const randomSeed = Math.floor(Math.random() * 1000);
    const API_KEY = "pk_cMYlf55YuDABkZZY";

    const strategies = [
      {
        name: "Pollinations Turbo (Con Clave)",
        type: "direct",
        url: `https://image.pollinations.ai/prompt/${encodedPrompt}?model=turbo&seed=${randomSeed}&width=1024&height=1024&nologo=true&key=${API_KEY}`
      },
      {
        name: "Pollinations Turbo (Sin Clave)",
        type: "direct",
        url: `https://image.pollinations.ai/prompt/${encodedPrompt}?model=turbo&seed=${randomSeed}&width=1024&height=1024&nologo=true`
      },
      {
        name: "Pollinations Flux (Calidad)",
        type: "direct",
        url: `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&seed=${randomSeed}&width=1024&height=1024&nologo=true&key=${API_KEY}`
      },
      {
        name: "Hercai (Backup A)",
        type: "async_json",
        endpoint: `https://corsproxy.io/?${encodeURIComponent(`https://hercai.onrender.com/v3/text2image?prompt=${encodedPrompt}`)}`
      },
      {
        name: "Hercai (Backup B)",
        type: "async_json",
        endpoint: `https://api.allorigins.win/get?url=${encodeURIComponent(`https://hercai.onrender.com/v3/text2image?prompt=${encodedPrompt}`)}`
      }
    ];

    const tryStrategy = async (index) => {
      if (index >= strategies.length) {
        setIsLoading(false);
        setLoadingStage('');
        alert("¡Lo siento muchísimo! Todos los servidores de IA están colapsados. Inténtalo de nuevo en un minuto. 😿");
        return;
      }

      const strategy = strategies[index];
      setLoadingStage(index === 0 ? 'Conectando...' : `Reintentando... (vía ${strategy.name})`);
      console.log(`[ColoreaAI] Intentando: ${strategy.name}`);

      let timeoutId;
      let alreadyMovedOn = false;

      const next = () => {
        if (!alreadyMovedOn) {
          alreadyMovedOn = true;
          clearTimeout(timeoutId);
          tryStrategy(index + 1);
        }
      };

      // Tiempo máximo de espera por servidor: 15 segundos
      timeoutId = setTimeout(() => {
        console.warn(`[ColoreaAI] Timeout en ${strategy.name}.`);
        next();
      }, 15000);

      try {
        let imageUrlToLoad;

        if (strategy.type === "async_json") {
          const response = await fetch(strategy.endpoint);
          const rawData = await response.json();
          // Manejo especial para AllOrigins que envuelve el JSON original en una propiedad 'contents'
          const data = strategy.name.includes("AllOrigins") ? JSON.parse(rawData.contents) : rawData;

          if (data && data.url) {
            imageUrlToLoad = data.url;
          } else {
            throw new Error("Respuesta inválida");
          }
        } else {
          imageUrlToLoad = strategy.url;
        }

        const img = new Image();
        img.referrerPolicy = "no-referrer";

        img.onload = () => {
          if (!alreadyMovedOn) {
            clearTimeout(timeoutId);
            console.log(`[ColoreaAI] Éxito con ${strategy.name}`);
            setGeneratedImage(imageUrlToLoad);
            addToHistory(imageUrlToLoad, prompt);
            setIsLoading(false);
            setLoadingStage('');
          }
        };

        img.onerror = () => {
          console.warn(`[ColoreaAI] Fallo de carga en ${strategy.name}`);
          next();
        };

        img.src = imageUrlToLoad;

      } catch (error) {
        console.error(`[ColoreaAI] Error en ${strategy.name}:`, error);
        next();
      }
    };

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
          <Generator onGenerate={handleGenerate} isLoading={isLoading} loadingStage={loadingStage} />
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
