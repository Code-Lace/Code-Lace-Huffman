const ALGORITHMS = [
  { id: "merge", name: "Merge Sort", nameShort: "Merge", category: "divide-conquer", bestCase: "Ω(n log n)", avgCase: "Θ(n log n)", worstCase: "O(n log n)", space: "O(n)", description: "Divide el arreglo a la mitad recursivamente y combina las mitades ordenadas.", color: "#a855f7" },
  { id: "quick", name: "Quick Sort", nameShort: "Quick", category: "divide-conquer", bestCase: "Ω(n log n)", avgCase: "Θ(n log n)", worstCase: "O(n²)", space: "O(log n) prom.; O(n) peor", description: "Elige un pivote, particiona el arreglo y ordena las particiones recursivamente.", color: "#e879f9" },
  { id: "selection", name: "Selection Sort", nameShort: "Selection", category: "brute-force", bestCase: "Ω(n²)", avgCase: "Θ(n²)", worstCase: "O(n²)", space: "O(1)", description: "Busca el mínimo en la parte no ordenada y lo coloca en su posición correcta.", color: "#f43f5e" }, /* Rosa/Rojo vivo */
  { id: "bubble", name: "Bubble Sort", nameShort: "Bubble", category: "brute-force", bestCase: "Ω(n)", avgCase: "Θ(n²)", worstCase: "O(n²)", space: "O(1)", description: "Compara pares adyacentes repetidamente e intercambia si están en orden incorrecto.", color: "#fb923c" }, /* Naranja claro */
  { id: "insertion", name: "Insertion Sort", nameShort: "Insertion", category: "brute-force", bestCase: "Ω(n)", avgCase: "Θ(n²)", worstCase: "O(n²)", space: "O(1)", description: "Construye la parte ordenada insertando cada elemento en su posición correcta.", color: "#facc15" }, /* Amarillo brillante */
  { id: "gnome", name: "Gnome Sort", nameShort: "Gnome", category: "brute-force", bestCase: "Ω(n)", avgCase: "Θ(n²)", worstCase: "O(n²)", space: "O(1)", description: "Similar a Insertion Sort pero mueve elementos hacia atrás usando intercambios.", color: "#4ade80" }, /* Verde */
  { id: "exchange", name: "Exchange Sort", nameShort: "Exchange", category: "brute-force", bestCase: "Ω(n²)", avgCase: "Θ(n²)", worstCase: "O(n²)", space: "O(1)", description: "Compara cada elemento con todos los siguientes e intercambia si es necesario.", color: "#06b6d4" }, /* Cyan */
  { id: "stooge", name: "Stooge Sort", nameShort: "Stooge", category: "brute-force", bestCase: "Ω(n^2.71)", avgCase: "Θ(n^2.71)", worstCase: "O(n^2.71)", space: "O(log n)", description: "Algoritmo recursivo muy ineficiente que ordena solapando tres partes del arreglo.", color: "#94a3b8", maxSize: 25 }
];

let activeView = "dashboard";
let visualizerMode = "single";
let selectedAlgoId = "bubble";
let secondaryAlgoId = "quick";
let arraySize = 30;
let speed = 80;
let steps = [];
let steps2 = [];
let stepIdx = 0;
let isPlaying = false;
let intervalId = null;
let currentArray = [];
let pythonSource1 = [];
let pythonSource2 = [];
let isGenerating = false;
let generationRequest = 0;
let benchmarkData = null;

//
function renderHuffmanTree(treeData) {
    const container = d3.select("#tree-container");
    container.selectAll("*").remove(); // Limpiar renderizados previos

    if (!treeData) return;

    const width = document.getElementById("tree-container").clientWidth || 800;
    const height = 500;
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };

    // Configurar SVG con Zoom
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .call(d3.zoom().scaleExtent([0.1, 4]).on("zoom", (event) => {
            g.attr("transform", event.transform);
        }))
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const g = svg.append("g"); 

    // Configurar el layout del árbol jerárquico
    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree().nodeSize([40, 60]); 
    treeLayout(root);

    // Centrar el árbol horizontalmente
    g.attr("transform", `translate(${width / 2}, 40)`);

    // Dibujar Enlaces (líneas)
    g.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        )
        .style("fill", "none")
        .style("stroke", "rgba(168, 85, 247, 0.4)")
        .style("stroke-width", "2px");

    // Crear Nodos
    const node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Círculos de los nodos (Morado para ramas, Cyan para hojas)
    node.append("circle")
        .attr("r", 14)
        .style("fill", d => d.children ? "#7c3aed" : "#06b6d4")
        .style("stroke", "rgba(255, 255, 255, 0.8)")
        .style("stroke-width", "2px");

    // Frecuencia (Número arriba del nodo)
    node.append("text")
        .attr("dy", "-1.4em")
        .attr("text-anchor", "middle")
        .style("fill", "#c084fc")
        .style("font-size", "11px")
        .style("font-family", "var(--font-mono)")
        .text(d => d.data.value);

    // Carácter (Letra dentro del nodo, solo para hojas)
    node.append("text")
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "var(--font-mono)")
        .text(d => d.children ? "" : d.data.name);
}

function badgeHTML(category) {
  return category === "divide-conquer"
    ? '<span class="badge-dv">Divide y Vencerás</span>'
    : '<span class="badge-fb">Fuerza Bruta</span>';
}

function populateSelects() {
  const optionsHTML = ALGORITHMS.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
  const sel1 = document.getElementById("select-algo-1");
  const sel2 = document.getElementById("select-algo-2");
  if (sel1) sel1.innerHTML = optionsHTML;
  if (sel2) sel2.innerHTML = optionsHTML;
  if (sel1) sel1.value = selectedAlgoId;
  if (sel2) sel2.value = secondaryAlgoId;
}

function renderDashboard() {
  const cardsGrid = document.getElementById("algo-cards-grid");
  if (cardsGrid) {
    cardsGrid.innerHTML = ALGORITHMS.map(algo => `
      <div class="algo-card" style="border-color: ${algo.color}55" onclick="selectAlgoAndOpenVisualizer('${algo.id}')">
        <div class="algo-card-dot" style="background: ${algo.color}; color: ${algo.color}"></div>
        <div>
          <div class="algo-card-name">${algo.name}</div>
          ${badgeHTML(algo.category)}
          <div class="algo-card-complexity">${algo.avgCase}</div>
        </div>
      </div>
    `).join("");
  }

  const tbody = document.getElementById("complexity-table-body");
  if (tbody) {
    tbody.innerHTML = ALGORITHMS.map(algo => `
      <tr onclick="selectAlgoAndOpenVisualizer('${algo.id}')" style="cursor: pointer;">
        <td><span class="table-algo-dot" style="background: ${algo.color}"></span>${algo.name}</td>
        <td>${badgeHTML(algo.category)}</td>
        <td><code>${algo.bestCase}</code></td>
        <td><code>${algo.avgCase}</code></td>
        <td><code>${algo.worstCase}</code></td>
        <td><code>${algo.space}</code></td>
      </tr>
    `).join("");
  }

  renderSidebarNav();
  loadDashboardBenchmark();
}

function renderSidebarNav() {
  const nav = document.getElementById("sidebar-nav");
  if (!nav) return;

  const divideConquer = ALGORITHMS.filter(a => a.category === "divide-conquer");
  const bruteForce = ALGORITHMS.filter(a => a.category === "brute-force");

  nav.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px;">
      <a class="nav-item ${activeView === 'dashboard' ? 'nav-item-active' : ''}" onclick="switchView('dashboard'); toggleSidebar(false);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        Dashboard
      </a>
      <a class="nav-item ${activeView === 'visualizer' ? 'nav-item-active' : ''}" onclick="switchView('visualizer'); toggleSidebar(false);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Visualizador de Algoritmos
      </a>
      <button type="button" class="nav-item ${activeView === 'huffman' ? 'nav-item-active' : ''}" onclick="switchView('huffman'); toggleSidebar(false);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        Comparador Huffman
      </button>
    </div>

    <div class="sidebar-section-label" style="font-size: 10px; font-weight: 700; color: #a855f7; text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 12px;">Divide y Vencerás</div>
    ${divideConquer.map(a => `
      <button class="nav-item" onclick="selectAlgoAndOpenVisualizer('${a.id}'); toggleSidebar(false);">
        <span class="nav-dot" style="color: ${a.color}; background: ${a.color};"></span>
        <span>${a.name}</span>
        <span class="nav-complexity">${a.avgCase}</span>
      </button>
    `).join("")}

    <div class="sidebar-section-label" style="font-size: 10px; font-weight: 700; color: #f97316; text-transform: uppercase; letter-spacing: 0.08em; padding: 12px 12px 6px 12px;">Fuerza Bruta</div>
    ${bruteForce.map(a => `
      <button class="nav-item" onclick="selectAlgoAndOpenVisualizer('${a.id}'); toggleSidebar(false);">
        <span class="nav-dot" style="color: ${a.color}; background: ${a.color};"></span>
        <span>${a.name}</span>
        <span class="nav-complexity">${a.avgCase}</span>
      </button>
    `).join("")}

  `;
}

function toggleSidebar(open) {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || !backdrop) {
    throw new Error("No se encontraron los elementos de la barra lateral.");
  }

  const shouldOpen = typeof open === "boolean"
    ? open
    : sidebar.classList.contains("sidebar-closed");

  sidebar.classList.toggle("sidebar-open", shouldOpen);
  sidebar.classList.toggle("sidebar-closed", !shouldOpen);
  backdrop.classList.toggle("hidden", !shouldOpen);

  const menuButton = document.querySelector(".menu-btn");
  if (menuButton) menuButton.setAttribute("aria-expanded", String(shouldOpen));
}

async function loadDashboardBenchmark() {
  const status = document.getElementById("benchmark-status");
  if (status) status.textContent = "Midiendo implementaciones Python...";
  try {
    const response = await fetch(`${API_BASE_URL}/api/benchmark`);
    if (!response.ok) throw new Error();
    const result = await response.json();
    benchmarkData = result;
    if (status) status.textContent = `Mediana de ${result.rounds} ejecuciones · ${result.line_series.length} algoritmos · Stooge excluido (limite n=12)`;
    renderRuntimeChart(result);
    renderScenarioChart(result);
  } catch (error) {
    if (status) status.textContent = "Benchmark no disponible (Inicia Uvicorn)";
  }
}

function formatMilliseconds(value) {
  return value < 1 ? value.toFixed(3) : value.toFixed(1);
}

function renderRuntimeChart(data) {
  const container = document.getElementById("bar-chart-container");
  if (!container || !data || !data.line_series) return;
  const width = 680, height = 250, padLeft = 58, padRight = 16, padTop = 14, padBottom = 34;
  const plotW = width - padLeft - padRight, plotH = height - padTop - padBottom;
  
  const validSeries = data.line_series;
  const allTimes = validSeries.flatMap(s => s.times_ms);
  const maxTime = Math.max(...allTimes, 0.001) * 1.08;
  const xFor = size => padLeft + size / 100 * plotW;
  const yFor = val => padTop + plotH - val / maxTime * plotH;

  let svg = `<svg viewBox="0 0 ${width} ${height}" class="recharts-svg">`;
  for (let t = 0; t <= 4; t++) {
    const val = maxTime * t / 4, y = yFor(val);
    svg += `<line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="rgba(168,85,247,0.15)" stroke-dasharray="3 3" />`;
    svg += `<text x="${padLeft - 7}" y="${y + 4}" text-anchor="end" fill="#c4b5fd" font-size="10" font-family="Outfit">${formatMilliseconds(val)}</text>`;
  }

  validSeries.forEach(series => {
    const algo = ALGORITHMS.find(a => a.id === series.algorithm);
    if (!algo) return;
    const pts = series.times_ms.map((v, i) => `${xFor(series.sizes[i])},${yFor(v)}`).join(" ");
    
    svg += `<polyline points="${pts}" fill="none" stroke="${algo.color}" stroke-width="2" stroke-linejoin="round" />`;
    
    series.times_ms.forEach((v, i) => {
      const cx = xFor(series.sizes[i]);
      const cy = yFor(v);
      svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="${algo.color}" />`;
    });
  });

  svg += `</svg>`;
  svg += `<div class="chart-legend">${validSeries.map(s => {
    const algo = ALGORITHMS.find(a => a.id === s.algorithm);
    return algo ? `<span><i style="background:${algo.color}"></i>${algo.nameShort}</span>` : '';
  }).join("")}</div>`;
  container.innerHTML = svg;
}

function renderScenarioChart(data) {
  const container = document.getElementById("scenario-chart-container");
  if (!container || !data || !data.scenarios) return;

  const scenarios = data.scenarios;
  const validAlgos = ALGORITHMS.map(a => a.id);
  
  const width = 680, height = 250, padLeft = 45, padRight = 16, padTop = 20, padBottom = 45;
  const plotW = width - padLeft - padRight, plotH = height - padTop - padBottom;

  let allTimes = [];
  scenarios.forEach(sc => {
    if (sc.measurements) {
      sc.measurements.forEach(m => {
        allTimes.push(m.time_ms);
      });
    }
  });

  const maxVal = Math.max(...allTimes, 0.001) * 1.15;
  const subCats = ["Ordenado", "Aleatorio", "Inverso"];
  const subColors = ["#10b981", "#a855f7", "#f97316"]; 
  const groupWidth = plotW / validAlgos.length;

  let svg = `<svg viewBox="0 0 ${width} ${height}" class="recharts-svg">`;
  
  for (let t = 0; t <= 4; t++) {
    const val = maxVal * t / 4, y = padTop + plotH - (val / maxVal) * plotH;
    svg += `<line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="rgba(168,85,247,0.15)" stroke-dasharray="3 3" />`;
    svg += `<text x="${padLeft - 5}" y="${y + 4}" text-anchor="end" fill="#c4b5fd" font-size="9" font-family="Outfit">${formatMilliseconds(val)}</text>`;
  }

  validAlgos.forEach((algoId, aIdx) => {
    const algo = ALGORITHMS.find(a => a.id === algoId);
    if (!algo) return;
    const gx = padLeft + aIdx * groupWidth + 2;
    const barW = Math.max(2, (groupWidth - 8) / 3);

    subCats.forEach((catName, sIdx) => {
      const scenarioObj = scenarios.find(s => s.name === catName);
      let val = 0;
      if (scenarioObj && scenarioObj.measurements) {
        const meas = scenarioObj.measurements.find(m => m.algorithm === algoId);
        if (meas) val = meas.time_ms;
      }

      const h = (val / maxVal) * plotH;
      const x = gx + sIdx * (barW + 1);
      const y = padTop + plotH - h;
      svg += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(2, h)}" fill="${subColors[sIdx]}" rx="2" />`;
    });

    svg += `<text x="${gx + groupWidth / 2 - 2}" y="${height - 12}" text-anchor="middle" fill="#c4b5fd" font-size="8" font-family="Outfit">${algo.nameShort}</text>`;
  });

  svg += `</svg>`;
  svg += `<div class="chart-legend"><span><i style="background:#10b981"></i>Ordenado</span><span><i style="background:#a855f7"></i>Aleatorio</span><span><i style="background:#f97316"></i>Inverso</span></div>`;
  container.innerHTML = svg;
}

function switchView(view) {
  activeView = view;
  const dash = document.getElementById("view-dashboard");
  const viz = document.getElementById("view-visualizer");
  const huf = document.getElementById("view-huffman");
  
  if (dash) dash.classList.toggle("hidden", view !== "dashboard");
  if (viz) viz.classList.toggle("hidden", view !== "visualizer");
  if (huf) huf.classList.toggle("hidden", view !== "huffman");

  const tabD = document.getElementById("tab-dashboard");
  const tabV = document.getElementById("tab-visualizer");
  const tabH = document.getElementById("tab-huffman");

  if (tabD) tabD.classList.toggle("topbar-tab-active", view === "dashboard");
  if (tabV) tabV.classList.toggle("topbar-tab-active", view === "visualizer");
  if (tabH) tabH.classList.toggle("topbar-tab-active", view === "huffman");

  const topD = document.getElementById("topbar-right-dashboard");
  const topV = document.getElementById("topbar-right-visualizer");
  const topH = document.getElementById("topbar-right-huffman");

  if (topD) topD.classList.toggle("hidden", view !== "dashboard");
  if (topV) topV.classList.toggle("hidden", view !== "visualizer");
  if (topH) topH.classList.toggle("hidden", view !== "huffman");

  renderSidebarNav();

  if (view === "visualizer") {
    populateSelects();
    updateVisualizerUI();
    if (steps.length === 0 && !isGenerating) handleGenerate();
  }
}

function selectAlgoAndOpenVisualizer(id) {
  selectedAlgoId = id;
  stopPlaying();
  steps = [];
  steps2 = [];
  stepIdx = 0;
  switchView("visualizer");
}

function handleModeChange(mode) {
  visualizerMode = mode;
  const wrapper2 = document.getElementById("wrapper-algo-2");
  const container2 = document.getElementById("bars-container-2");
  const sourcePanel2 = document.getElementById("source-panel-wrapper-2");
  const sourcesWrapper = document.getElementById("python-sources-wrapper");

  if (mode === "dual") {
    if (wrapper2) wrapper2.classList.remove("hidden");
    if (container2) container2.classList.remove("hidden");
    if (sourcePanel2) sourcePanel2.classList.remove("hidden");
    if (sourcesWrapper) sourcesWrapper.style.gridTemplateColumns = "1fr 1fr";
  } else {
    if (wrapper2) wrapper2.classList.add("hidden");
    if (container2) container2.classList.add("hidden");
    if (sourcePanel2) sourcePanel2.classList.add("hidden");
    if (sourcesWrapper) sourcesWrapper.style.gridTemplateColumns = "1fr";
  }
  handleGenerate();
}

function handleAlgoChange(index, algoId) {
  if (index === 1) selectedAlgoId = algoId;
  else secondaryAlgoId = algoId;
  handleGenerate();
}

function generateRandomArray(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 96) + 4);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function renderSourceCode(codeContainerId, sourceArr, activeLine) {
  const container = document.getElementById(codeContainerId);
  if (!container) return;
  if (!sourceArr || sourceArr.length === 0) {
    container.textContent = "Esperando código Python...";
    return;
  }
  container.innerHTML = sourceArr.map((line, index) =>
    `<span class="code-line ${index + 1 === activeLine ? 'code-line-active' : ''}" data-line="${index + 1}"><span class="code-line-number">${String(index + 1).padStart(2, "0")}</span><span>${escapeHTML(line) || " "}</span></span>`
  ).join("");
}

function updateVisualizerUI() {
  const algo1 = ALGORITHMS.find(a => a.id === selectedAlgoId) || ALGORITHMS[0];
  const algo2 = ALGORITHMS.find(a => a.id === secondaryAlgoId) || ALGORITHMS[1];

  const dot1 = document.getElementById("viz-info-dot");
  if (dot1) dot1.style.background = algo1.color;
  const name1 = document.getElementById("viz-algo-name");
  if (name1) name1.textContent = algo1.name;
  const badge1 = document.getElementById("viz-algo-badge");
  if (badge1) badge1.innerHTML = badgeHTML(algo1.category);
  const desc1 = document.getElementById("viz-algo-desc");
  if (desc1) desc1.textContent = algo1.description;
  const best1 = document.getElementById("viz-best");
  if (best1) best1.textContent = algo1.bestCase;
  const avg1 = document.getElementById("viz-avg");
  if (avg1) avg1.textContent = algo1.avgCase;
  const worst1 = document.getElementById("viz-worst");
  if (worst1) worst1.textContent = algo1.worstCase;
  const space1 = document.getElementById("viz-space");
  if (space1) space1.textContent = algo1.space;

  if (visualizerMode === "dual") {
    const name2 = document.getElementById("viz-algo-name-2");
    if (name2) name2.textContent = algo2.name;
    const badge2 = document.getElementById("viz-algo-badge-2");
    if (badge2) badge2.innerHTML = badgeHTML(algo2.category);
    const avg2 = document.getElementById("viz-avg-2");
    if (avg2) avg2.textContent = algo2.avgCase;
  }

  const step = steps[stepIdx] || { array: currentArray, comparing: [], swapping: [], sorted: [] };
  const step2 = steps2[stepIdx] || { array: currentArray, comparing: [], swapping: [], sorted: [] };
  const arr = step.array || currentArray;
  const maxVal = Math.max(...arr, 1);

  const stepCur = document.getElementById("viz-step-current");
  if (stepCur) stepCur.textContent = steps.length > 0 ? stepIdx + 1 : 0;
  const stepTot = document.getElementById("viz-step-total");
  if (stepTot) stepTot.textContent = steps.length;
  
  const progress = steps.length > 1 ? Math.round((stepIdx / (steps.length - 1)) * 100) : 0;
  const progFill = document.getElementById("viz-progress-fill");
  if (progFill) progFill.style.width = `${progress}%`;

  const isDone = steps.length > 0 && stepIdx >= steps.length - 1;
  const doneBadge = document.getElementById("viz-done-badge");
  if (doneBadge) doneBadge.classList.toggle("hidden", !isDone);

  const btnBack = document.getElementById("btn-step-back");
  if (btnBack) btnBack.disabled = stepIdx === 0 || steps.length === 0;
  const btnFwd = document.getElementById("btn-step-forward");
  if (btnFwd) btnFwd.disabled = stepIdx >= steps.length - 1 || steps.length === 0;
  const btnRes = document.getElementById("btn-reset");
  if (btnRes) btnRes.disabled = stepIdx === 0;

  const barsContainer = document.getElementById("bars-container");
  if (barsContainer) {
    if (barsContainer.children.length !== arr.length) {
      barsContainer.innerHTML = arr.map(() => '<div class="bar-wrapper"><div class="sort-bar"></div></div>').join("");
    }
    arr.forEach((val, idx) => {
      const h = Math.max(4, (val / maxVal) * 94);
      let cls = "sort-bar";
      if (step.sorted && step.sorted.includes(idx)) cls += " bar-sorted";
      else if (step.swapping && step.swapping.includes(idx)) cls += " bar-swapping";
      else if (step.comparing && step.comparing.includes(idx)) cls += " bar-comparing";
      const wrapper = barsContainer.children[idx];
      if (wrapper) {
        wrapper.title = val;
        wrapper.firstElementChild.className = cls;
        wrapper.firstElementChild.style.height = `${h}%`;
      }
    });
  }

  if (visualizerMode === "dual") {
    const barsContainer2 = document.getElementById("bars-container-2");
    const arr2 = step2.array || currentArray;
    if (barsContainer2) {
      if (barsContainer2.children.length !== arr2.length) {
        barsContainer2.innerHTML = arr2.map(() => '<div class="bar-wrapper"><div class="sort-bar"></div></div>').join("");
      }
      arr2.forEach((val, idx) => {
        const h = Math.max(4, (val / maxVal) * 94);
        let cls = "sort-bar";
        if (step2.sorted && step2.sorted.includes(idx)) cls += " bar-sorted";
        else if (step2.swapping && step2.swapping.includes(idx)) cls += " bar-swapping";
        else if (step2.comparing && step2.comparing.includes(idx)) cls += " bar-comparing";
        const wrapper = barsContainer2.children[idx];
        if (wrapper) {
          wrapper.title = val;
          wrapper.firstElementChild.className = cls;
          wrapper.firstElementChild.style.height = `${h}%`;
        }
      });
    }
  }

  const title1 = document.getElementById("source-title-1");
  if (title1) title1.textContent = `Python Source (${algo1.name})`;
  renderSourceCode("source-code-1", pythonSource1, step.line);

  if (visualizerMode === "dual") {
    const title2 = document.getElementById("source-title-2");
    if (title2) title2.textContent = `Python Source (${algo2.name})`;
    renderSourceCode("source-code-2", pythonSource2, step2.line);
  }
}

async function fetchAlgorithmSteps(algoId, dataArray) {
  const response = await fetch(`${API_BASE_URL}/api/visualize/${encodeURIComponent(algoId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: dataArray })
  });
  if (!response.ok) throw new Error("Fallo al conectar con backend.");
  return await response.json();
}

async function handleGenerate() {
  stopPlaying();
  const requestId = ++generationRequest;
  isGenerating = true;
  currentArray = generateRandomArray(arraySize);
  steps = [];
  steps2 = [];
  stepIdx = 0;
  updateVisualizerUI();

  try {
    const payload1 = await fetchAlgorithmSteps(selectedAlgoId, currentArray);
    if (requestId !== generationRequest) return;
    steps = payload1.steps;
    pythonSource1 = payload1.source;

    if (visualizerMode === "dual") {
      const payload2 = await fetchAlgorithmSteps(secondaryAlgoId, currentArray);
      if (requestId !== generationRequest) return;
      steps2 = payload2.steps;
      pythonSource2 = payload2.source;
    }

    updateVisualizerUI();
  } catch (error) {
    console.error("Error conectando al backend de Python:", error);
  } finally {
    isGenerating = false;
    updateVisualizerUI();
  }
}

function startPlaying() {
  isPlaying = true;
  updateVisualizerUI();
  intervalId = setInterval(() => {
    const maxLen = visualizerMode === "dual" ? Math.max(steps.length, steps2.length) : steps.length;
    if (stepIdx >= maxLen - 1) stopPlaying();
    else { stepIdx++; updateVisualizerUI(); }
  }, speed);
}

function stopPlaying() {
  isPlaying = false;
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  updateVisualizerUI();
}

function handlePlayPause() {
  const maxLen = visualizerMode === "dual" ? Math.max(steps.length, steps2.length) : steps.length;
  if (maxLen === 0) { handleGenerate(); return; }
  if (stepIdx >= maxLen - 1) stepIdx = 0;
  if (isPlaying) stopPlaying(); else startPlaying();
}

function handleStepForward() {
  const maxLen = visualizerMode === "dual" ? Math.max(steps.length, steps2.length) : steps.length;
  if (stepIdx < maxLen - 1) { stepIdx++; updateVisualizerUI(); }
}

function handleStepBack() { if (stepIdx > 0) { stepIdx--; updateVisualizerUI(); } }
function handleReset() { stopPlaying(); stepIdx = 0; updateVisualizerUI(); }
function handleSpeedChange(val) { speed = Math.max(2, 1002 - Number(val)); }
function handleSizeChange(val) { arraySize = Number(val); handleGenerate(); }

window.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
});