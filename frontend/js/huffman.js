async function subirArchivoTxt() {
  const input = document.getElementById('archivoCorpus');
  const resultadosDiv = document.getElementById('resultados-compresion');
  
  if (!input || input.files.length === 0) {
    resultadosDiv.classList.remove('hidden');
    resultadosDiv.innerHTML = '<span style="color: #fb7185;">Por favor, selecciona un archivo .txt de Project Gutenberg primero.</span>';
    return;
  }

  const archivo = input.files[0];
  const formData = new FormData();
  formData.append('file', archivo);

  resultadosDiv.classList.remove('hidden');
  resultadosDiv.innerHTML = 'Subiendo archivo al backend y procesando Huffman...';

  try {
    const respuesta = await fetch(`${API_BASE_URL}/api/comprimir`, {
      method: 'POST',
      body: formData
    });

    if (!respuesta.ok) throw new Error(`Error en el servidor: ${respuesta.status}`);

    const datos = await respuesta.json();
    const huffmanData = datos.huffman;

    resultadosDiv.innerHTML = `
        <div style="margin-bottom: 16px; border-bottom: 1px dashed rgba(168,85,247,0.3); padding-bottom: 12px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center;">
            <div>
                <span style="color: var(--purple-pale); font-weight: bold;">Archivo:</span> ${datos.archivo} <br>
                <span style="color: var(--purple-pale); font-weight: bold;">Tamaño original:</span> ${datos.tamano_original_bytes} bytes <br>
                <span style="color: var(--purple-pale); font-weight: bold;">Estado:</span> ${datos.estado} <br>
                <span style="color: var(--purple-pale); font-weight: bold;">Tiempo de ejecución:</span> ${datos.tiempo_ejecucion_segundos} segundos
            </div>
            <div style="text-align: right; background: rgba(74, 222, 128, 0.1); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(74, 222, 128, 0.3);">
                <div style="color: var(--green); font-weight: bold; font-size: 15px;">${huffmanData.tasa_compresion}</div>
                <div style="font-size: 11px; color: var(--text-dim);">
                    De ${huffmanData.bits_originales.toLocaleString()} a ${huffmanData.bits_comprimidos.toLocaleString()} bits
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
            <div style="background: rgba(28, 16, 53, 0.5); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
                <strong style="color: var(--purple-pale);">1. Frecuencias (Nodos: ${huffmanData.nodos_unicos})</strong>
                <div style="margin-top: 8px; max-height: 180px; overflow-y: auto; padding-right: 5px;">
                    ${Object.entries(huffmanData.frecuencias).map(([char, freq]) => 
                        `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(168,85,247,0.1);">
                            <code style="color: var(--cyan); background: rgba(6,182,212,0.1); padding: 2px 6px; border-radius: 4px;">'${char === '\n' ? '\\n' : char === '\r' ? '\\r' : char.replace(/</g, '&lt;')}'</code>
                            <span style="color: var(--text-dim); font-family: var(--font-mono);">${freq}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
            
            <div style="background: rgba(28, 16, 53, 0.5); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
                <strong style="color: var(--purple-pale);">4. Códigos Binarios</strong>
                <div style="margin-top: 8px; max-height: 180px; overflow-y: auto; padding-right: 5px;">
                    ${Object.entries(huffmanData.codigos).map(([char, code]) => 
                        `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(168,85,247,0.1);">
                            <code style="color: var(--cyan); background: rgba(6,182,212,0.1); padding: 2px 6px; border-radius: 4px;">'${char === '\n' ? '\\n' : char === '\r' ? '\\r' : char.replace(/</g, '&lt;')}'</code>
                            <code style="color: var(--green); letter-spacing: 1px;">${code}</code>
                        </div>`
                    ).join('')}
                </div>
            </div>
        </div>
        
        <div style="background: rgba(28, 16, 53, 0.5); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border);">
            <strong style="color: var(--purple-pale);">5. Fragmento Codificado (Primeros 500 bits)</strong>
            <p style="margin-top: 10px; word-break: break-all; color: var(--text-muted); font-size: 12px; line-height: 1.6; letter-spacing: 0.5px;">
                ${huffmanData.texto_codificado}...
            </p>
        </div>
    `;
  } catch (error) {
    console.error('Fallo en la comunicación:', error);
    resultadosDiv.innerHTML = '<span style="color: #fb7185;">Error de conexión con el backend de Huffman en Python. Asegúrate de que uvicorn esté corriendo.</span>';
  }
}