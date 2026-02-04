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

  const handleGenerate = async (prompt) => {
    setIsLoading(true);
    setGeneratedImage(null);

    const englishPrompt = translatePrompt(prompt);

    // Configuración
    const enhancedPrompt = `${englishPrompt}, coloring book page, high resolution, fine black and white line art, clean lines, sharp details, white background, vector style, cute, for kids, no color, no shading, no grayscale, no realism, no overlapping lines`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const randomSeed = Math.floor(Math.random() * 1000);
    const API_KEY = "pk_cMYlf55YuDABkZZY"; // Clave proporcionada por el usuario

    // URL base (sin clave en query param, usaremos Header)
    const baseUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${randomSeed}&width=1024&height=1024&nologo=true`;

    console.log("Iniciando generación con Auth...");

    try {
      // INTENTO 1: Fetch Directo con Autenticación (Bearer Token)
      // Esto es lo más robusto y profesional.
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          // 'User-Agent': 'ColoreaAI/1.0' // Opcional, a veces ayuda
        }
      });

      console.log("Estado respuesta Pollinations:", response.status);

      if (!response.ok) {
        // Manejo de errores específicos
        if (response.status === 401 || response.status === 403) throw new Error("AUTH_ERROR: Clave API inválida o bloqueada.");
        if (response.status === 429) throw new Error("LIMIT_ERROR: Has excedido el límite de uso.");
        if (response.status >= 500) throw new Error("SERVER_ERROR: Los servidores de Pollinations tienen problemas.");
        throw new Error(`HTTP_ERROR: ${response.status}`);
      }

      // Si todo va bien, obtenemos la imagen como Blob
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setGeneratedImage(objectUrl);
      addToHistory(objectUrl, prompt);
      console.log("¡Éxito! Imagen generada y procesada.");

    } catch (error) {
      console.error("Fallo detallado:", error);

      let errorMessage = "¡Vaya! Los duendes de Internet están dormidos. 🎨";

      if (error.message.includes("AUTH_ERROR")) errorMessage = "Error de autorización con la IA. Revisa la API Key.";
      if (error.message.includes("LIMIT_ERROR")) errorMessage = "Has creado muchos dibujos hoy. ¡Descansa un poco!";
      if (error.message.includes("SERVER_ERROR")) errorMessage = "El cerebro de la IA está mareado (Error 500). Intenta en 5 min.";

      // INTENTO 2: Fallback a Proxy (wsrv.nl) si falla la conexión directa
      // Solo intentamos esto si NO es un error de Auth/Límite (porque fallaría igual)
      if (!error.message.includes("AUTH_ERROR") && !error.message.includes("LIMIT_ERROR")) {
        try {
          console.log("Intentando fallback vía wsrv.nl...");
          // En fallback ponemos la key en la URL porque wsrv no pasa headers personalizados
          const fallbackUrl = `https://wsrv.nl/?url=${encodeURIComponent(baseUrl + `&key=${API_KEY}`)}&output=jpg`;

          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = fallbackUrl;
          });

          setGeneratedImage(fallbackUrl);
          addToHistory(fallbackUrl, prompt);
          console.log("¡Salvado por el backup!");
          return; // Salimos si el backup funciona
        } catch (backupError) {
          console.warn("El backup también falló.");
        }
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
