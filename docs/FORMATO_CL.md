# Formato `.cl`

El comparador guarda el diccionario de Huffman y los datos comprimidos en el mismo archivo para recuperar el texto desde el navegador.

| Posición en bytes | Tamaño | Campo |
|---|---:|---|
| 0 | 4 bytes | Longitud del encabezado JSON como entero de 32 bits sin signo. El lector lo interpreta en orden little-endian. |
| 4 | Longitud del encabezado | Encabezado JSON codificado en UTF-8. |
| 4 + longitud del encabezado | Hasta el final del archivo | Bits de Huffman empaquetados en bytes. |

El encabezado JSON contiene tres campos.

| Campo | Contenido |
|---|---|
| `b` | Número de bits válidos de los datos comprimidos. |
| `o` | Tamaño original informado por el backend. Si falta o es cero, el frontend usa el tamaño del texto en bytes UTF-8. |
| `c` | Diccionario que asigna a cada carácter su código binario. |

El lector reconstruye el árbol con `c`, recorre cada byte desde el bit más significativo y procesa hasta `b` bits. Si el último byte se completa con ceros, esos bits de relleno quedan fuera de `b`. El formato carece de suma de comprobación. Para verificar el resultado, compara el texto descargado con el archivo original.
