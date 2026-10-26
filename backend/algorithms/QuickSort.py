from algorithms.trace_utils import record_step


def quick_sort(lista, on_step=None):

	_quick_sort(lista, 0, len(lista) - 1, on_step)


def _quick_sort(lista, inicio, fin, on_step=None):
	if inicio >= fin:
		return

	pivote = lista[fin]
	indice_menor = inicio
	for indice in range(inicio, fin):
		record_step(on_step, lista, comparing=[indice, fin])
		if lista[indice] <= pivote:
			lista[indice_menor], lista[indice] = lista[indice], lista[indice_menor]
			record_step(on_step, lista, swapping=[indice_menor, indice])
			indice_menor += 1

	lista[indice_menor], lista[fin] = lista[fin], lista[indice_menor]
	record_step(on_step, lista, swapping=[indice_menor, fin])
	_quick_sort(lista, inicio, indice_menor - 1, on_step)
	_quick_sort(lista, indice_menor + 1, fin, on_step)
	if inicio == 0 and fin == len(lista) - 1:
		record_step(on_step, lista, sorted_indices=range(len(lista)))
