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
    const respuesta = await fetch('https://code-lace-huffman.onrender.com/api/comprimir', {
      method: 'POST',
      body: formData
    });

    if (!respuesta.ok) throw new Error(`Error en el servidor: ${respuesta.status}`);

    const datos = await respuesta.json();
    const huffmanData = datos.huffman;

 if (huffmanData.arbol_d3) {
        renderHuffmanTree(huffmanData.arbol_d3);
    }
    renderArbolHuffmanBinario(huffmanData);
    renderizarArbolMST(huffmanData);

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
                   De ${(huffmanData?.bits_originales ?? 0).toLocaleString()} a ${(huffmanData?.bits_comprimidos ?? 0).toLocaleString()} bits
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
        <div class="chart-card" style="margin-top: 20px;">
            <h3 class="chart-title">Representación del Árbol de Huffman</h3>
            <div id="tree-container" style="width: 100%; height: 500px; overflow: hidden; background: rgba(11,7,23,0.3); border-radius: 8px; border: 1px dashed rgba(168,85,247,0.3); cursor: grab;"></div>
        </div>
        
        <!-- Contenedor del Árbol de Expansión Mínima (MST - CL-12) -->
        <div style="background: rgba(28, 16, 53, 0.5); padding: 16px; border-radius: 8px; border: 1px solid var(--card-border); margin-top: 20px;">
            <strong style="color: var(--purple-pale);">7. Módulo Gráfico: Árbol de Expansión Mínima (MST - CL-12)</strong>
            <div id="huffman-mst-container" style="margin-top: 12px; width: 100%; overflow-x: auto; text-align: center;">
            </div>
        </div>
    `;

    if (huffmanData.arbol_d3) {
        renderHuffmanTree(huffmanData.arbol_d3);
    }
    renderArbolHuffmanBinario(huffmanData);
    renderizarArbolMST(huffmanData);

  } catch (error) {
    console.error('Fallo en la comunicación:', error);
    resultadosDiv.innerHTML = '<span style="color: #fb7185;">Error de conexión con el backend en la nube. Si estás usando la versión en Render, recuerda que el servidor puede tardar unos segundos en despertar tras inactividad. Intenta de nuevo.</span>';
  }
}

// ===== Árbol binario de Huffman (D3) =====

// Reconstruye el árbol a partir de los códigos: '0' = izquierda, '1' = derecha
function construirArbolDesdeCodigos(huffmanData) {
  const codigos = huffmanData.codigos || {};
  const frecs = huffmanData.frecuencias || {};
  const raiz = { name: '', value: 0, bit: '', children: [] };

  for (const [char, code] of Object.entries(codigos)) {
    let nodo = raiz;
    for (const bit of code) {
      let hijo = nodo.children.find(c => c.bit === bit);
      if (!hijo) {
        hijo = { name: '', value: 0, bit, children: [] };
        nodo.children.push(hijo);
      }
      nodo = hijo;
    }
    nodo.name = char;
    nodo.value = frecs[char] ?? 0;
  }

  // Ordena (0 izquierda, 1 derecha) y suma frecuencias en nodos internos
  const procesar = (n) => {
    if (n.children.length === 0) { delete n.children; return n.value; }
    n.children.sort((a, b) => a.bit.localeCompare(b.bit));
    n.value = n.children.reduce((s, c) => s + procesar(c), 0);
    return n.value;
  };
  procesar(raiz);
  return raiz;
}

function etiquetaCaracter(c) {
  if (c === ' ') return '␣';
  if (c === '\n') return '\\n';
  if (c === '\r') return '\\r';
  if (c === '\t') return '\\t';
  return c;
}

function renderArbolHuffmanBinario(huffmanData) {
  const el = document.getElementById('tree-container');
  if (!el) return;
  el.innerHTML = '';

  if (!huffmanData || !huffmanData.codigos || Object.keys(huffmanData.codigos).length === 0) {
    el.innerHTML = '<span style="color: var(--text-dim); padding: 12px; display: block;">No hay códigos para graficar el árbol.</span>';
    return;
  }

  const data = construirArbolDesdeCodigos(huffmanData);
  const width = el.clientWidth || 800;
  const height = el.clientHeight || 500;

  const root = d3.hierarchy(data);
  d3.tree().nodeSize([26, 70])(root);

  const svg = d3.select(el).append('svg')
    .attr('width', '100%')
    .attr('height', '100%');
  const g = svg.append('g');

  // Enlaces
  g.selectAll('.huff-link')
    .data(root.links())
    .enter().append('path')
    .attr('class', 'huff-link')
    .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y))
    .style('fill', 'none')
    .style('stroke', 'rgba(168, 85, 247, 0.45)')
    .style('stroke-width', '1.5px');

  // Etiquetas 0 / 1 en cada rama
  g.selectAll('.huff-bit')
    .data(root.links())
    .enter().append('text')
    .attr('x', d => (d.source.x + d.target.x) / 2)
    .attr('y', d => (d.source.y + d.target.y) / 2)
    .attr('text-anchor', 'middle')
    .style('fill', '#4ade80')
    .style('font-size', '10px')
    .style('font-family', 'var(--font-mono)')
    .text(d => d.target.data.bit);

  // Nodos
  const nodo = g.selectAll('.huff-node')
    .data(root.descendants())
    .enter().append('g')
    .attr('class', 'huff-node')
    .attr('transform', d => `translate(${d.x},${d.y})`);

  nodo.append('title')
    .text(d => d.children
      ? `Nodo interno · frecuencia ${d.data.value}`
      : `'${etiquetaCaracter(d.data.name)}' · frecuencia ${d.data.value}`);

  nodo.append('circle')
    .attr('r', d => d.children ? 8 : 11)
    .style('fill', d => d.children ? '#7c3aed' : '#06b6d4')
    .style('stroke', 'rgba(255,255,255,0.8)')
    .style('stroke-width', '1.5px');

  // Carácter dentro de las hojas
  nodo.filter(d => !d.children).append('text')
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .style('fill', '#fff')
    .style('font-size', '11px')
    .style('font-weight', 'bold')
    .style('font-family', 'var(--font-mono)')
    .text(d => etiquetaCaracter(d.data.name));

  // Frecuencia debajo de las hojas
  nodo.filter(d => !d.children).append('text')
    .attr('dy', '2.3em')
    .attr('text-anchor', 'middle')
    .style('fill', '#c084fc')
    .style('font-size', '9px')
    .style('font-family', 'var(--font-mono)')
    .text(d => d.data.value);

  // Zoom / arrastre
  const zoom = d3.zoom()
    .scaleExtent([0.05, 4])
    .on('zoom', (event) => g.attr('transform', event.transform));
  svg.call(zoom);

  // Ajuste inicial para que todo el árbol quepa en el cuadro
  const nodos = root.descendants();
  const minX = d3.min(nodos, d => d.x);
  const maxX = d3.max(nodos, d => d.x);
  const maxY = d3.max(nodos, d => d.y);
  const k = Math.min(1, width / (maxX - minX + 60), height / (maxY + 80));
  const tx = width / 2 - ((minX + maxX) / 2) * k;
  svg.call(zoom.transform, d3.zoomIdentity.translate(tx, 30).scale(k));
}

// --- Módulo Gráfico de Árbol de Expansión Mínima (MST / CL-12) ---
function renderizarArbolMST(huffmanData) {
    const container = document.getElementById('huffman-mst-container');
    if (!container) return;

    const frecuenciasOrdenadas = Object.entries(huffmanData.frecuencias || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    if (frecuenciasOrdenadas.length === 0) {
        container.innerHTML = '<span style="color: var(--text-dim);">No hay datos suficientes para graficar el MST.</span>';
        return;
    }

    const width = 600;
    const height = 200;
    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: 600px; height: auto;">`;
    
    const rootX = width / 2;
    const rootY = 35;
    
    svg += `<circle cx="${rootX}" cy="${rootY}" r="16" fill="rgba(168, 85, 247, 0.2)" stroke="var(--purple-pale)" stroke-width="2"/>`;
    svg += `<text x="${rootX}" y="${rootY + 4}" fill="#ffffff" font-size="9" font-family="Outfit" text-anchor="middle">MST</text>`;

    const totalNodos = frecuenciasOrdenadas.length;
    const spacingX = width / (totalNodos + 1);

    frecuenciasOrdenadas.forEach(([char, freq], index) => {
        const nodeX = spacingX * (index + 1);
        const nodeY = 150;

        svg += `<line x1="${rootX}" y1="${rootY + 16}" x2="${nodeX}" y2="${nodeY - 20}" stroke="rgba(74, 222, 128, 0.4)" stroke-width="1.5"/>`;
        svg += `<circle cx="${nodeX}" cy="${nodeY}" r="20" fill="rgba(74, 222, 128, 0.15)" stroke="var(--green)" stroke-width="1.5"/>`;
        
        const charLabel = char === '\n' ? '\\n' : char === '\r' ? '\\r' : char;
        svg += `<text x="${nodeX}" y="${nodeY - 3}" fill="var(--green)" font-size="10" font-weight="bold" font-family="Outfit" text-anchor="middle">'${charLabel}'</text>`;
        svg += `<text x="${nodeX}" y="${nodeY + 10}" fill="var(--text-dim)" font-size="8" font-family="Outfit" text-anchor="middle">${freq}</text>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
}