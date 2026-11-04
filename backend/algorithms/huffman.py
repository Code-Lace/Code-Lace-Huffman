import heapq
from collections import Counter

class NodoHuffman:
    def __init__(self, caracter, frecuencia):
        self.caracter = caracter
        self.frecuencia = frecuencia
        self.izq = None
        self.der = None

    # Sobrecarga del operador "menor que" para que heapq ordene por frecuencia
    def __lt__(self, otro):
        return self.frecuencia < otro.frecuencia

def generar_codigos(nodo, prefijo="", codigos=None):
    if codigos is None:
        codigos = {}
    if nodo is not None:
        if nodo.caracter is not None:
            codigos[nodo.caracter] = prefijo
        generar_codigos(nodo.izq, prefijo + "0", codigos)
        generar_codigos(nodo.der, prefijo + "1", codigos)
    return codigos

def comprimir_huffman(texto: str) -> dict:
    if not texto:
        return {"error": "Texto vacío"}

    # 1. Calcular frecuencias de cada carácter
    frecuencias = Counter(texto)

    # 2. Crear cola de prioridad (min-heap)
    heap = [NodoHuffman(char, freq) for char, freq in frecuencias.items()]
    heapq.heapify(heap)

    # 3. Construir el árbol de Huffman (O(n log n))
    while len(heap) > 1:
        nodo_izq = heapq.heappop(heap)
        nodo_der = heapq.heappop(heap)
        
        # Nodo interno (sin carácter) suma las frecuencias de sus hijos
        nodo_fusion = NodoHuffman(None, nodo_izq.frecuencia + nodo_der.frecuencia)
        nodo_fusion.izq = nodo_izq
        nodo_fusion.der = nodo_der
        
        heapq.heappush(heap, nodo_fusion)

    # 4. Generar el diccionario de códigos binarios
    raiz = heap[0] if heap else None
    codigos = generar_codigos(raiz)

    # 5. Calcular métricas teóricas de compresión
    bits_originales = len(texto) * 8 
    bits_comprimidos = sum(frecuencias[char] * len(codigo) for char, codigo in codigos.items())
    
    tasa_compresion = (1 - (bits_comprimidos / bits_originales)) * 100 if bits_originales > 0 else 0

    # -> AGREGA ESTA LÍNEA PARA EL FRAGMENTO VISUAL <-
    texto_codificado = "".join([codigos[c] for c in texto])

    # -> ACTUALIZA EL DICCIONARIO DE RETORNO <-
    return {
        "tasa_compresion": f"{round(tasa_compresion, 2)}% de reducción",
        "bits_originales": bits_originales,
        "bits_comprimidos": bits_comprimidos,
        "nodos_unicos": len(frecuencias),
        "frecuencias": dict(frecuencias),
        "codigos": codigos,
        "texto_codificado": texto_codificado[:500]
    }
