import React, { useState } from 'react';
// Importa tu logo (pon logo.png en src/)
import logo from './logo.png';

function App() {
  const [calories, setCalories] = useState(2000);
  const [carbs, setCarbs] = useState(50);
  const [fats, setFats] = useState(30);
  const [protein, setProtein] = useState(20);
  const [sheetUrl, setSheetUrl] = useState('');
  const [dietType, setDietType] = useState('omnivora');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [menuResult, setMenuResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        'https://menu-llm-worker.lopezbuenoj.workers.dev/generate-menu',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calories,
            macros: { carbs, fats, protein },
            sheetUrl,
            dietType,       // <- Nuevo
            mealsPerDay     // <- Nuevo
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Logo centrado */}
      <img src={logo} alt="Logo" className="w-24 h-auto mb-6" />

      <h1 className="text-3xl font-bold mb-6">Generador de Menús Nutricionales</h1>

      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-4"
      >
        {/* Calorías */}
        <div>
          <label className="block font-medium mb-1">Calorías diarias:</label>
          <input
            type="number"
            value={calories}
            onChange={e => setCalories(+e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">% Carbohidratos:</label>
            <input
              type="number"
              value={carbs}
              onChange={e => setCarbs(+e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">% Grasas:</label>
            <input
              type="number"
              value={fats}
              onChange={e => setFats(+e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">% Proteínas:</label>
            <input
              type="number"
              value={protein}
              onChange={e => setProtein(+e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Sheets URL */}
        <div>
          <label className="block font-medium mb-1">URL de Google Sheet:</label>
          <input
            type="text"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Desplegable Tipo de Dieta */}
        <div>
          <label className="block font-medium mb-1">Tipo de dieta:</label>
          <select
            value={dietType}
            onChange={e => setDietType(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="omnivora">Omnívora</option>
            <option value="vegetariana">Vegetariana</option>
            <option value="vegana">Vegana</option>
          </select>
        </div>

        {/* Desplegable Número de Comidas */}
        <div>
          <label className="block font-medium mb-1">Comidas al día:</label>
          <select
            value={mealsPerDay}
            onChange={e => setMealsPerDay(+e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {[1,2,3,4,5].map(n => (
              <option key={n} value={n}>{n} comida{n>1?'s':''}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Generando…' : 'Generar Menú'}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>

      {menuResult && (
        <div className="w-full max-w-md mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Menú Generado</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
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
