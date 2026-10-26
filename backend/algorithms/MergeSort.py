from algorithms.trace_utils import record_step


def merge_sort(arr, on_step=None):
    _merge_sort(arr, 0, len(arr) - 1, on_step)
    record_step(on_step, arr, sorted_indices=range(len(arr)))


def _merge_sort(arr, start, end, on_step=None):
    if start >= end:
        return

    mid = (start + end) // 2
    _merge_sort(arr, start, mid, on_step)
    _merge_sort(arr, mid + 1, end, on_step)

    left_half = arr[start:mid + 1]
    right_half = arr[mid + 1:end + 1]
    i = j = 0
    index = start

    while i < len(left_half) and j < len(right_half):
        record_step(on_step, arr, comparing=[start + i, mid + 1 + j])
        if left_half[i] <= right_half[j]:
            arr[index] = left_half[i]
            record_step(on_step, arr, swapping=[index])
            i += 1
        else:
            arr[index] = right_half[j]
            record_step(on_step, arr, swapping=[index])
            j += 1
        index += 1

    while i < len(left_half):
        arr[index] = left_half[i]
        record_step(on_step, arr, swapping=[index])
        i += 1
        index += 1

    while j < len(right_half):
        arr[index] = right_half[j]
        record_step(on_step, arr, swapping=[index])
        j += 1
        index += 1


