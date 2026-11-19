# Formato propietario `.cl`

Los archivos `.cl` descargados desde la interfaz contienen todos los datos necesarios para verificar e interpretar la compresión Huffman.

## Layout binario

Todos los números enteros se almacenan en formato **big-endian**:

| Offset | Tamaño | Campo |
|---|---:|---|
| 0 | 7 bytes | Magic `CLHUFF1` |
| 7 | 4 bytes | Cantidad de bytes originales (UTF-8) |
| 11 | 4 bytes | Cantidad de bits válidos |
| 15 | 4 bytes | Longitud de la tabla de códigos |
| 19 | variable | Tabla de códigos JSON UTF-8 |
| variable | `ceil(bits_validos / 8)` bytes | Payload Huffman |
| final | 4 bytes | CRC32 IEEE (tabla + payload) |

La tabla JSON corresponde a un objeto `{"caracter": "codigo"}`. Los códigos contienen únicamente `0` y `1`. El relleno final del último byte se completa con ceros y no forma parte del contenido según `bits_validos`.

## Integridad

El CRC32 cubre el magic, el encabezado, la tabla de códigos y el payload, pero no incluye el propio campo CRC. El emisor debe calcularlo sobre los bytes desde el offset 0 hasta el inicio del CRC.

Para verificar un archivo:

1. Confirmar que los 7 primeros bytes sean `CLHUFF1`.
2. Leer original length, valid bits y table length.
3. Validar que tabla, payload y CRC estén dentro del archivo.
4. Decodificar el JSON UTF-8.
5. Calcular el CRC32 del contenido y compararlo con el CRC final.
6. Decodificar exactamente `valid bits` usando la tabla.

## Ejemplo de uso previsto

```text
entrada.txt -> análisis UTF-8 -> códigos Huffman -> entrada.cl
entrada.cl  -> validar encabezado/CRC -> tabla Huffman -> texto recuperado
```
