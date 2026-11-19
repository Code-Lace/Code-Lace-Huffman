# Evidencias de pruebas e integridad

Este archivo documenta cómo reproducir las verificaciones incluida en el repositorio.

## Suite automatizada

Ejecutar desde la raíz:

```bash
python3 -m unittest discover -s tests -v
```

La suite cubre:

- ordenamiento correcto en los ocho algoritmos, incluyendo entradas vacías, duplicados y listas negativas;
- compresión y decodificación Huffman;
- cálculo de métricas para texto Unicode;
- layout binario `.cl`;
- round-trip del texto desde el payload;
- CRC32 del archivo.

## Resultado registrado

Ejecutado el 18 de noviembre de 2026:

```text
test_round_trip_ascii (test_project.HuffmanTests.test_round_trip_ascii) ... ok
test_unicode_metrics_use_utf8_bytes (test_project.HuffmanTests.test_unicode_metrics_use_utf8_bytes) ... ok
test_cl_layout_round_trip_and_crc (test_project.IntegrityFormatTests.test_cl_layout_round_trip_and_crc) ... ok
test_all_sorters_handle_duplicates_and_empty_input (test_project.SorterTests.test_all_sorters_handle_duplicates_and_empty_input) ... ok

Ran 4 tests in 0.001s
OK
```

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
