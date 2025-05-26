# menu-llm-serverless
# Generador Automático de Menús Nutricionales

Proyecto de Trabajo Fin de Grado (TFG) que automatiza la creación de menús semanales personalizados basados en objetivos nutricionales, utilizando inteligencia artificial y arquitectura serverless.

---

## Descripción

Esta aplicación web permite al usuario introducir parámetros nutricionales como calorías diarias, distribución de macronutrientes, tipo de dieta (omnívora, vegetariana, vegana), número de comidas al día y una URL de Google Sheets para recibir el menú generado.  

El sistema usa la API de OpenAI para crear menús semanales y los vuelca automáticamente en Google Sheets mediante un webhook de Google Apps Script, facilitando la planificación para profesionales de la salud y pacientes.

---

## Tecnologías utilizadas

- **Frontend:** React  
- **Backend serverless:** Cloudflare Workers + base de datos D1 (SQLite)  
- **Generación de menús:** OpenAI Chat Completions API (GPT-3.5-turbo / GPT-4o-mini)  
- **Almacenamiento y formateo:** Google Sheets + Google Apps Script  
- **CI/CD:** GitHub Actions + Cloudflare Wrangler

---

## Funcionalidades principales

- Interfaz web sencilla e intuitiva para definir parámetros nutricionales y preferencias dietéticas.  
- Generación rápida y automática de menús con cantidades en gramos.  
- Actualización automática y con formato amigable en Google Sheets.  
- Arquitectura serverless para escalabilidad y coste optimizado.

---

## Uso

1. Clonar el repositorio.  
2. Configurar las variables de entorno necesarias:  
   - `OPENAI_API_KEY`  
   - `SHEETS_WEBHOOK`  
3. Desplegar el backend con Wrangler en Cloudflare.  
4. Construir y desplegar el frontend con `npm run build` y Cloudflare Pages.  
5. Acceder a la aplicación web, introducir datos y generar menús.

---

## Referencias

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)  
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat/completions)  
- [Google Apps Script Documentation](https://developers.google.com/apps-script)

---

Jairo Peset - Proyecto TFG