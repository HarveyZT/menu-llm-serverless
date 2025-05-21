// frontend/src/App.js
import './App.css';
import React, { useState } from 'react';
import logo from './logo.png';


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
  <div className="app-container">
    <img src={logo} alt="Logo" className="app-logo" />
    <h1 className="app-title">Generador de Menús</h1>

    <form onSubmit={handleSubmit} className="app-form">
      {/* Calorías diarias */}
      <div className="form-group">
        <label>Calorías diarias:</label>
        <input
          type="number"
          value={calories}
          onChange={e => setCalories(+e.target.value)}
        />
      </div>

      {/* Macros en porcentaje */}
      <div className="form-group">
        <label>% Carbohidratos:</label>
        <input
          type="number"
          value={carbs}
          onChange={e => setCarbs(+e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>% Grasas:</label>
        <input
          type="number"
          value={fats}
          onChange={e => setFats(+e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>% Proteínas:</label>
        <input
          type="number"
          value={protein}
          onChange={e => setProtein(+e.target.value)}
        />
      </div>

      {/* URL de Google Sheets */}
      <div className="form-group">
        <label>URL de Google Sheet:</label>
        <input
          type="text"
          value={sheetUrl}
          onChange={e => setSheetUrl(e.target.value)}
        />
      </div>

      {/* Tipo de dieta */}
      <div className="form-group">
        <label>Tipo de dieta:</label>
        <select
          value={dietType}
          onChange={e => setDietType(e.target.value)}
        >
          <option value="omnivora">Omnívora</option>
          <option value="vegetariana">Vegetariana</option>
          <option value="vegana">Vegana</option>
        </select>
      </div>

      {/* Número de comidas */}
      <div className="form-group">
        <label>Número de comidas:</label>
        <select
          value={mealsPerDay}
          onChange={e => setMeals(e.target.value)}
        >
          {[1,2,3,4,5].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Botón enviar */}
      <button type="submit" disabled={loading}>
        {loading ? 'Generando…' : 'Generar Menú'}
      </button>
    </form>

    {error && <p className="error-message">Error: {error}</p>}

    {menuResult && (
      <div className="result-card">
        <h2>Menú Generado</h2>
        <pre>{JSON.stringify(menuResult, null, 2)}</pre>
      </div>
    )}
  </div>
);
}

export default App;