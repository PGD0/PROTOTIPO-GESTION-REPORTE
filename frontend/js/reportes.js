// reportes.js - Lógica simplificada para vista de tarjetas
document.addEventListener('DOMContentLoaded', async function() {
  if (!window.apiMock) return;
  await window.apiMock.initMockDB();
  
  // La función renderReportes ahora está en main.js y se llama automáticamente
  // Este archivo se mantiene por compatibilidad pero la lógica principal está en main.js
}); 