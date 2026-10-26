from algorithms.trace_utils import record_step


def selection_sort(lista, on_step=None):

	n = len(lista)
	sorted_indices = [] if on_step is not None else ()
	for i in range(n):
		minimo = i
		for j in range(i + 1, n):
			record_step(on_step, lista, comparing=[minimo, j], sorted_indices=sorted_indices)
			if lista[j] < lista[minimo]:
				minimo = j
		if minimo != i:
			lista[i], lista[minimo] = lista[minimo], lista[i]
			record_step(on_step, lista, swapping=[i, minimo], sorted_indices=sorted_indices)
		if on_step is not None:
			sorted_indices.append(i)
	record_step(on_step, lista, sorted_indices=range(n))
