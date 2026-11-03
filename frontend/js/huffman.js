async function subirArchivoTxt() {
  const input = document.getElementById('archivoCorpus');
  const resultadosDiv = document.getElementById('resultados-compresion');
  
  if (!input || input.files.length === 0) {
    resultadosDiv.classList.remove('hidden');
    resultadosDiv.innerHTML = '<span style="color: #fb7185;">por favor, selecciona un archivo .txt de project gutenberg primero.</span>';
    return;
  }

  const archivo = input.files[0];
  const formData = new FormData();
  formData.append('file', archivo);

  resultadosDiv.classList.remove('hidden');
  resultadosDiv.innerHTML = 'subiendo archivo al backend y procesando huffman...';

  try {
    const respuesta = await fetch(`${API_BASE_URL}/api/comprimir`, {
      method: 'POST',
      body: formData
    });

    if (!respuesta.ok) throw new Error(`error en el servidor: ${respuesta.status}`);

    const datos = await respuesta.json();
    resultadosDiv.innerHTML = `
      <strong>archivo recibido:</strong> ${datos.archivo} <br>
      <strong>tamaño original:</strong> ${datos.tamano_original_bytes} bytes <br>
      <strong>estado:</strong> ${datos.estado} <br>
      <strong>tiempo de ejecución:</strong> ${datos.tiempo_ejecucion_segundos} segundos
    `;
  } catch (error) {
    console.error('fallo en la comunicación:', error);
    resultadosDiv.innerHTML = '<span style="color: #fb7185;">error de conexión con el backend de huffman en python. asegúrate de que uvicorn esté corriendo.</span>';
  }
}