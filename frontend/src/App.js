import React, { useState } from 'react';

function App() {
  const [calories, setCalories] = useState(2000);
  const [carbs, setCarbs] = useState(50);
  const [fats, setFats] = useState(30);
  const [protein, setProtein] = useState(20);
  const [sheetUrl, setSheetUrl] = useState('');
  const [menuResult, setMenuResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        'https://https://menu-llm-worker.lopezbuenoj.workers.dev/.workers.dev/generate-menu',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calories,
            macros: { carbs, fats, protein },
            sheetUrl
          })
        }
      );
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const menu = await res.json();
      setMenuResult(menu);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generador de Menús</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Calorías diarias:</label>
          <input
            type="number"
            value={calories}
            onChange={e => setCalories(+e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>% Carbohidratos:</label>
            <input
              type="number"
              value={carbs}
              onChange={e => setCarbs(+e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
          <div>
            <label>% Grasas:</label>
            <input
              type="number"
              value={fats}
              onChange={e => setFats(+e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
          <div>
            <label>% Proteínas:</label>
            <input
              type="number"
              value={protein}
              onChange={e => setProtein(+e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
        </div>
        <div>
          <label>URL de Google Sheet:</label>
          <input
            type="text"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Generando…' : 'Generar Menú'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">Error: {error}</p>}

      {menuResult && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Menú Generado</h2>
          <pre className="bg-gray-100 p-4 overflow-auto">
            {JSON.stringify(menuResult, null, 2)}
          </pre>
          <p className="mt-2 text-green-600">
            ✅ La hoja de Google Sheets debería haberse actualizado.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
