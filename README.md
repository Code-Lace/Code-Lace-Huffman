# Code & Lace

Plataforma web interactiva para estudiar algoritmos de ordenamiento y compresión mediante visualizaciones, métricas y animaciones paso a paso.

## Funcionalidades

### Visualizador de ordenamiento

- Visualización animada con barras.
- Ejecución paso a paso, pausa, retroceso, reinicio y ajuste de velocidad.
- Comparación simultánea de dos algoritmos.
- Código Python asociado resaltado según el paso actual.
- Comparación de complejidad teórica y medición de tiempo.

### Algoritmos implementados

- Gnome Sort
- Exchange Sort
- Quick Sort
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Stooge Sort

El benchmark compara siete algoritmos sobre tamaños de 10 a 100 elementos y también mide entrada ordenada, aleatoria e inversa con 100 elementos. Stooge Sort no forma parte del benchmark automático debido a su costo.

### Módulo Huffman

- Lectura de archivos `.txt`, preferentemente de corpora como Project Gutenberg.
- Construcción del árbol Huffman y generación de códigos binarios.
- Visualización del árbol binario y frecuencias de caracteres.
- Cálculo de bytes/bits originales y comprimidos.
- Descarga del resultado en formato `.cl`.
- Visualización auxiliar relacionada con MST/árboles.

La especificación completa del archivo `.cl` está en [docs/FORMATO_CL.md](docs/FORMATO_CL.md).

## Arquitectura

```text
frontend/
  index.html
  styles.css
  js/
    visualizer.js
    huffman.js

backend/
  main.py
  requirements.txt
  algorithms/
    *.py
```

- **Frontend:** HTML, CSS y JavaScript con D3.js para los gráficos.
- **Backend:** Python 3 con FastAPI y Uvicorn.
- **Despliegue frontend:** Vercel.
- **Despliegue backend:** Render.

## API

| Método | Ruta | Uso |
|---|---|---|
| `POST` | `/api/sort/{algorithm}` | Ejecuta un algoritmo |
| `POST` | `/api/visualize/{algorithm}` | Genera el arreglo ordenado y los pasos |
| `GET` | `/api/benchmark` | Obtiene series y escenarios de rendimiento |
| `POST` | `/api/huffman` | Construye el árbol y códigos desde texto |
| `POST` | `/api/comprimir` | Procesa un archivo `.txt` |

`algorithm` admite: `bubble`, `selection`, `insertion`, `exchange`, `gnome`, `stooge`, `merge` y `quick`.

## Ejecución local

### Backend

```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload
```

El backend queda disponible en `http://127.0.0.1:8000`. La documentación interactiva está en `http://127.0.0.1:8000/docs`.

### Frontend

El frontend puede servirse con un servidor estático desde la carpeta `frontend`:

```bash
cd frontend
python3 -m http.server 5500
```

Abrir `http://127.0.0.1:5500`.

Por defecto, la configuración de JavaScript usa el backend desplegado en Render. Para usar el backend local, cambiar `API_BASE_URL` en `frontend/index.html` y/o ajustar la URL directa usada por `frontend/js/huffman.js`.

## Pruebas e integridad

Las verificaciones automatizadas están en [tests/test_project.py](tests/test_project.py). El procedimiento y las categorías cubiertas están documentados en [evidence/PRUEBAS.md](evidence/PRUEBAS.md).

Ejecutar:

```bash
python3 -m unittest discover -s tests -v
```

Las pruebas verifican los ocho ordenamientos, Huffman y el layout/CRC de los archivos `.cl`.

## Formato `.cl`

El archivo exportado incluye:

- magic `CLHUFF1`;
- longitud original en bytes UTF-8;
- cantidad de bits válidos;
- tabla de códigos Huffman;
- payload binario Huffman;
- CRC32 IEEE para integridad.

No confundir el tamaño comprimido mostrado con el tamaño bruto del payload: el archivo `.cl` también contiene metadatos y el CRC.

## Equipo

- **Marlene Lares y Liliana Mejía:** frontend y diseño de UI.
- **Camila Suárez y Bruno Salazar:** integración y gestión del repositorio.
- **Todo el equipo:** backend y lógica de algoritmos.

## Uso de inteligencia artificial

Durante el desarrollo se utilizaron herramientas de IA como apoyo para depuración, revisión de lógica y generación de ideas de diseño. Las respuestas se revisaron e integraron manualmente en el proyecto.
