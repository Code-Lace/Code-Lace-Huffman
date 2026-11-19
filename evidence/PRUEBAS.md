# Verificación de la compresión y descompresión

## Comprobación manual

1. En el Comparador de Huffman, carga un archivo `.txt` con varios caracteres distintos y descarga el archivo `.cl`.
2. Selecciona ese `.cl` en el mismo comparador y descarga el `.txt` restaurado.
3. Compara ambos archivos desde la terminal con `cmp entrada.txt entrada_descomprimido.txt`. Si son idénticos, `cmp` termina con código 0.

## Suite automatizada

Ejecuta la suite desde la raíz del repositorio.

```bash
python3 -m unittest discover -s tests -v
```

Las cuatro pruebas cubren los algoritmos de ordenamiento, la compresión Huffman de texto ASCII, la métrica para texto Unicode y un ejemplo de ida y vuelta del formato `.cl` implementado en Python. La comprobación manual anterior verifica el flujo del navegador.

## API

Después de iniciar el backend:

```bash
cd backend
python3 -m uvicorn main:app --reload
```

Verificar documentación OpenAPI en `http://127.0.0.1:8000/docs` y usar:

- `POST /api/sort/{algorithm}`
- `POST /api/visualize/{algorithm}`
- `GET /api/benchmark`
- `POST /api/huffman`
- `POST /api/comprimir`
