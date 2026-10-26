from algorithms.trace_utils import record_step


def insertion_sort(lista, on_step=None):
    
    arr = lista
    for i in range(1, len(arr)):
        clave = arr[i]
        j = i - 1
        # Compara la clave con los elementos anteriores y los desplaza
        while j >= 0:
            record_step(on_step, arr, comparing=[j, j + 1])
            if arr[j] <= clave:
                break
            arr[j + 1] = arr[j]
            record_step(on_step, arr, swapping=[j, j + 1])
            j -= 1
        arr[j + 1] = clave
        record_step(on_step, arr, swapping=[j + 1])
    record_step(on_step, arr, sorted_indices=range(len(arr)))
    return arr