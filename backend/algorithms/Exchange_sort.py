from algorithms.trace_utils import record_step


def exchange_sort(lista, on_step=None):

    arr = lista
    n = len(arr)
    for i in range(n - 1):
        for j in range(i + 1, n):
            record_step(on_step, arr, comparing=[i, j])
            # Si el elemento posterior es menor, intercambia de inmediato
            if arr[j] < arr[i]:
                arr[i], arr[j] = arr[j], arr[i]
                record_step(on_step, arr, swapping=[i, j])
    record_step(on_step, arr, sorted_indices=range(n))
    return arr