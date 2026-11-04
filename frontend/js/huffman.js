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
    resultadosDiv.innerHTML = `
      <strong>Archivo recibido:</strong> ${datos.archivo} <br>
      <strong>Tamaño original:</strong> ${datos.tamano_original_bytes} bytes <br>
      <strong>Estado:</strong> ${datos.estado} <br>
      <strong>Tiempo de ejecución:</strong> ${datos.tiempo_ejecucion_segundos} segundos
    `;
  } catch (error) {
    console.error('Fallo en la comunicación:', error);
    resultadosDiv.innerHTML = '<span style="color: #fb7185;">Error de conexión con el backend de Huffman en Python. Asegúrate de que uvicorn esté corriendo.</span>';
  }
}