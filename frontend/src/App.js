// frontend/src/App.js

import React, { useState } from 'react';
import './App.css';


// URL de tu Worker serverless (ajusta el subdominio según tu despliegue)
const WORKER_URL = 'https://menu-llm-worker.lopezbuenoj.workers.dev/generate-menu';

function App() {
  // Estados de entrada del formulario
  const [calories, setCalories] = useState(2000);
  const [carbs, setCarbs] = useState(50);
  const [fats, setFats] = useState(30);
  const [protein, setProtein] = useState(20);
  const [sheetUrl, setSheetUrl] = useState('');
  const [dietType, setDietType] = useState('omnivora');
  const [mealsPerDay, setMeals] = useState('3');

  // Estado para el resultado del menú y control de UI
  const [menuResult, setMenuResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función que maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita recarga de página
    setLoading(true);
    setError('');
    setMenuResult(null);

    try {
      // Llamada POST a tu Worker con los parámetros
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calories,
          macros: { carbs, fats, protein },
          sheetUrl,
          dietType,
          mealsPerDay
        }),
      });

      // Si la respuesta no es OK, lanzamos un error
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }

      // Parseamos el JSON y actualizamos el estado
      const menu = await response.json();
      setMenuResult(menu);

    } catch (err) {
      // Mostramos cualquier error ocurrido
      setError(err.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generador de Menús Nutricionales</h1>

      {/* Formulario de parámetros */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Calorías diarias */}
        <div>
          <label>Calorías diarias:</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(+e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>

        {/* Macros en porcentaje */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>% Carbohidratos:</label>
            <input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(+e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
          <div>
            <label>% Grasas:</label>
            <input
              type="number"
              value={fats}
              onChange={(e) => setFats(+e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
          <div>
            <label>% Proteínas:</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(+e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
        </div>

        {/* URL de Google Sheets */}
        <div>
          <label>URL de Google Sheet:</label>
          <input
            type="text"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>

        {/* Tipo de dieta - desplegable */}

        <div>
          <label>Tipo de dieta:</label>
          <select
            value={dietType}
            onChange={e => setDietType(e.target.value)}
            className="border px-2 py-1 w-full"
          >
            <option value="omnivora">Omnívora</option>
            <option value="vegetariana">Vegetariana</option>
            <option value="vegana">Vegana</option>
          </select>
        </div>

        {/* Número de comidas - desplegable */}

        <div>
          <label>Número de comidas:</label>
          <select
            value={mealsPerDay}
            onChange={e => setMeals(e.target.value)}
            className="border px-2 py-1 w-full"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Generando…' : 'Generar Menú'}
        </button>
      </form>

      {/* Mostrar error si existe */}
      {error && <p className="text-red-500 mt-4">Error: {error}</p>}

      {/* Mostrar menú generado */}
      {menuResult && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Menú Generado</h2>
          <pre className="bg-gray-100 p-4 overflow-auto">
            {JSON.stringify(menuResult, null, 2)}
          </pre>
          <p className="mt-2 text-green-600">
            ✅ Tu Google Sheet debería haberse actualizado.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;