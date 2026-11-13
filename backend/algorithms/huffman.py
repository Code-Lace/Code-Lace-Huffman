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

# Justo antes del return en comprimir_huffman:
    raiz = heap[0] if heap else None
    codigos = generar_codigos(raiz)
    
    # Generar el árbol para D3.js
    arbol_d3 = tree_to_dict(raiz)

    texto_codificado = "".join([codigos[c] for c in texto])

    return {
        "tasa_compresion": f"{round(tasa_compresion, 2)}% de reducci",
        "bits_originales": bits_originales,
        "bits_comprimidos": bits_comprimidos,
        "nodos_unicos": len(frecuencias),
        "frecuencias": dict(frecuencias),
        "codigos": codigos,
        "texto_codificado": texto_codificado[:500],
        "arbol_d3": arbol_d3  # <--- Agrega esta línea
    }

def tree_to_dict(node):
    if node is None:
        return None
    
    # Manejar saltos de línea y retornos de carro visualmente
    char_name = ""
    if node.caracter is not None:
        char_name = repr(node.caracter).replace("'", "")
        
    result = {
        "name": char_name,
        "value": node.frecuencia
    }
    
    children = []
    if getattr(node, 'izq', None):
        children.append(tree_to_dict(node.izq))
    if getattr(node, 'der', None):
        children.append(tree_to_dict(node.der))
        
    if children:
        result["children"] = children
        
    return result
