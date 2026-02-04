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

  // Simple helper to improve Spanish prompts
  const translatePrompt = (text) => {
    const lowerText = text.toLowerCase();
    let translated = text;

    // Basic mapping for common ambiguous terms
    const mappings = {
      // Vehicles
      'nave': ' spaceship', 'espacial': ' space sci-fi', 'cohete': ' rocket',
      'coche': ' car', 'carro': ' car', 'auto': ' car',
      'avión': ' airplane', 'avion': ' airplane', 'helicóptero': ' helicopter',
      'caza': ' fighter jet', 'jet': ' fighter jet',
      'barco': ' boat', 'submarino': ' submarine',
      'tren': ' train', 'camión': ' truck', 'autobús': ' bus',
      'bici': ' bicycle', 'bicicleta': ' bicycle', 'moto': ' motorcycle',

      // Animals
      'gato': ' cat', 'gatito': ' kitten',
      'perro': ' dog', 'perrito': ' puppy',
      'cerdo': ' pig', 'chancho': ' pig', 'puerco': ' pig',
      'pez': ' fish', 'peces': ' fish', 'ballena': ' whale', 'delfín': ' dolphin', 'tiburón': ' shark',
      'pájaro': ' bird', 'loro': ' parrot', 'águila': ' eagle', 'búho': ' owl',
      'león': ' lion', 'tigre': ' tiger', 'elefante': ' elephant', 'jirafa': ' giraffe',
      'mono': ' monkey', 'oso': ' bear', 'panda': ' panda',
      'caballo': ' horse', 'vaca': ' cow', 'oveja': ' sheep', 'gallina': ' chicken', 'pato': ' duck',
      'conejo': ' rabbit', 'ratón': ' mouse', 'ardilla': ' squirrel',
      'serpiente': ' snake', 'tortuga': ' turtle', 'rana': ' frog',
      'mariposa': ' butterfly', 'abeja': ' bee', 'araña': ' spider',

      // Fantasy
      'dragón': ' dragon', 'dragon': ' dragon',
      'unicornio': ' unicorn', 'pegaso': ' pegasus',
      'sirena': ' mermaid',
      'hada': ' fairy', 'duende': ' elf', 'gnomo': ' gnome',
      'bruja': ' witch', 'mago': ' wizard',
      'fantasma': ' ghost', 'vampiro': ' vampire', 'zombie': ' zombie',
      'monstruo': ' monster', 'alien': ' alien', 'extraterrestre': ' alien',
      'robot': ' robot', 'superhéroe': ' superhero',
      'princesa': ' princess', 'príncipe': ' prince', 'rey': ' king', 'reina': ' queen',
      'castillo': ' castle',

      // Nature
      'flor': ' flower', 'rosa': ' rose', 'girasol': ' sunflower',
      'árbol': ' tree', 'bosque': ' forest', 'selva': ' jungle',
      'montaña': ' mountain', 'volcán': ' volcano',
      'río': ' river', 'lago': ' lake', 'mar': ' ocean', 'playa': ' beach',
      'sol': ' sun', 'luna': ' moon', 'estrella': ' star', 'nube': ' cloud',
      'lluvia': ' rain', 'nieve': ' snow', 'arcoíris': ' rainbow', 'arcoiris': ' rainbow',
      'fuego': ' fire',

      // People & Professions
      'niño': ' boy', 'niña': ' girl', 'bebé': ' baby',
      'mamá': ' mom', 'papá': ' dad', 'abuelo': ' grandpa', 'abuela': ' grandma',
      'policía': ' police officer', 'bombero': ' firefighter', 'médico': ' doctor', 'doctor': ' doctor',
      'maestra': ' teacher', 'profesor': ' teacher',
      'payaso': ' clown', 'pirata': ' pirate', 'ninja': ' ninja', 'astronauta': ' astronaut',

      // Food
      'manzana': ' apple', 'plátano': ' banana', 'fresa': ' strawberry',
      'helado': ' ice cream', 'pastel': ' cake', 'tarta': ' cake', 'galleta': ' cookie',
      'pizza': ' pizza', 'hamburguesa': ' burger', 'papas': ' fries',
      'caramelo': ' candy', 'chocolate': ' chocolate',

      // Objects
      'pelota': ' ball', 'balón': ' ball',
      'muñeca': ' doll', 'peluche': ' teddy bear',
      'globo': ' balloon', 'cometa': ' kite',
      'libro': ' book', 'lápiz': ' pencil',
      'regalo': ' gift', 'juguete': ' toy'
    };

    Object.keys(mappings).forEach(key => {
      if (lowerText.includes(key)) {
        translated += mappings[key];
      }
    });

    return translated;
  };

  const handleGenerate = (prompt) => {
    setIsLoading(true);
    setGeneratedImage(null);

    const englishPrompt = translatePrompt(prompt);

    // Configuración para el modelo TURBO (Más rápido y estable)
    const enhancedPrompt = `${englishPrompt}, coloring book page, line art, black and white, clean lines, white background, no shading, minimal detail, cute, for kids`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const randomSeed = Math.floor(Math.random() * 1000);
    const API_KEY = "pk_cMYlf55YuDABkZZY";

    // ESTRATEGIA NUCLEAR: URL SIMPLE + MODELO TURBO (Súper estable)
    // Usamos model=turbo para evitar errores 502 del servidor
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=turbo&seed=${randomSeed}&width=1024&height=1024&nologo=true&key=${API_KEY}`;

    console.log("Generando con TURBO:", imageUrl);

    // Precarga "Native" (Sin Fetch, solo navegador)
    const img = new Image();
    // 'no-referrer' suele ayudar a evitar bloqueos de host
    img.referrerPolicy = "no-referrer";

    img.onload = () => {
      console.log("¡Imagen TURBO cargada correctamente!");
      setGeneratedImage(imageUrl);
      addToHistory(imageUrl, prompt);
      setIsLoading(false);
    };

    img.onerror = (err) => {
      console.error("Error cargando imagen:", err);
      alert("Lo sentimos, no se pudo generar el dibujo. Inténtalo de nuevo.");
      setIsLoading(false);
    };

    // Al asignar el src, el navegador inicia la carga inmediatamente
    img.src = imageUrl;
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
