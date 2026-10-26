from algorithms.trace_utils import record_step


def gnome_sort(lista, on_step=None):
    arr = lista
    i = 0
    n = len(arr)
    
    while i < n:
        if i > 0:
            record_step(on_step, arr, comparing=[i - 1, i])
        if i == 0 or arr[i] >= arr[i - 1]:
            i += 1  # Avanza si está en orden
        else:
            arr[i], arr[i - 1] = arr[i - 1], arr[i]  # Intercambia
            record_step(on_step, arr, swapping=[i - 1, i])
            i -= 1  # Retrocede un paso
    record_step(on_step, arr, sorted_indices=range(n))
    return arr