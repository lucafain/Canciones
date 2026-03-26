# Canciones - LyricAI

Página web estilo moderno con "IA" asistente para buscar letras de canciones por título + artista.

## Funcionalidades

- Interfaz visual llamativa (glassmorphism + neon).
- Formulario para buscar letra con título y artista.
- Mensajes tipo asistente IA durante la búsqueda.
- Pregunta inicial para elegir dispositivo (teléfono o PC) y optimiza layout:
  - **Teléfono:** diseño vertical.
  - **PC:** diseño horizontal.
- Historial de búsquedas en `localStorage` con botón para repetir búsquedas.
- Botón para limpiar historial.

## Cómo usar

1. Abrí `index.html` en el navegador.
2. Elegí si estás en teléfono o PC.
3. Escribí título + artista y tocá **Buscar letra**.
4. La letra aparece en pantalla y la búsqueda se guarda en historial.

## API utilizada

Se consume `https://api.lyrics.ovh/v1/{artist}/{title}` para obtener letras.
