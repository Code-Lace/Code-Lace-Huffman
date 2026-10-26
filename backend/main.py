import time
import random
from statistics import median

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from algorithms import BubbleSort, Exchange_sort, Gnome_sort, Insertion_sort
from algorithms import MergeSort, QuickSort, SelectionSort, StoogeSort
from algorithms.trace_utils import get_display_source


app = FastAPI(title="Code & Lace Backend", version="1.0")

# Permitir conexiones desde el Frontend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SortRequest(BaseModel):
    data: list[int]


SORTERS = {
    "bubble": (BubbleSort.bubble_sort, BubbleSort),
    "selection": (SelectionSort.selection_sort, SelectionSort),
    "insertion": (Insertion_sort.insertion_sort, Insertion_sort),
    "exchange": (Exchange_sort.exchange_sort, Exchange_sort),
    "gnome": (Gnome_sort.gnome_sort, Gnome_sort),
    "stooge": (StoogeSort.stooge_sort, StoogeSort),
    "merge": (MergeSort.merge_sort, MergeSort),
    "quick": (QuickSort.quick_sort, QuickSort),
}

BENCHMARK_ALGORITHMS = tuple(name for name in SORTERS if name != "stooge")
BENCHMARK_SIZES = tuple(range(10, 101, 10))
BENCHMARK_ROUNDS = 7


def sort_data(algo_name, data, on_step=None):
    sort_function, _ = SORTERS[algo_name]
    arr = data.copy()
    result = sort_function(arr, on_step=on_step)
    return arr if result is None else result


def measure_sort(sort_function, values):
    durations = []
    for _ in range(BENCHMARK_ROUNDS):
        sample = values.copy()
        start = time.perf_counter()
        sort_function(sample)
        durations.append((time.perf_counter() - start) * 1000)
    return round(median(durations), 6)


@app.post("/api/sort/{algo_name}")
def run_sort(algo_name: str, request: SortRequest):
    if algo_name not in SORTERS:
        return {"error": "Algoritmo no registrado"}

    start = time.perf_counter()
    arr = sort_data(algo_name, request.data)
    duration = (time.perf_counter() - start) * 1000

    return {
        "algorithm": algo_name,
        "sorted_data": arr,
        "time_ms": round(duration, 4)
    }


@app.get("/api/benchmark")
def benchmark_algorithms():
    line_series = []
    for algo_name in BENCHMARK_ALGORITHMS:
        sort_function, _ = SORTERS[algo_name]
        measurements = []
        for size in BENCHMARK_SIZES:
            generator = random.Random(2026 + size)
            values = [generator.randrange(1, 100_001) for _ in range(size)]
            measurements.append(measure_sort(sort_function, values))
        line_series.append({"algorithm": algo_name, "sizes": BENCHMARK_SIZES, "times_ms": measurements})

    scenario_size = 100
    scenarios = []
    for scenario_name in ("Ordenado", "Aleatorio", "Inverso"):
        measurements = []
        for algo_name in BENCHMARK_ALGORITHMS:
            sort_function, _ = SORTERS[algo_name]
            generator = random.Random(2026 + scenario_size)
            random_values = [generator.randrange(1, 100_001) for _ in range(scenario_size)]
            if scenario_name == "Ordenado":
                values = sorted(random_values)
            elif scenario_name == "Inverso":
                values = sorted(random_values, reverse=True)
            else:
                values = random_values
            measurements.append({
                "algorithm": algo_name,
                "input_size": scenario_size,
                "time_ms": measure_sort(sort_function, values),
            })
        scenarios.append({"name": scenario_name, "measurements": measurements})

    return {
        "sizes": BENCHMARK_SIZES,
        "line_series": line_series,
        "scenario_size": scenario_size,
        "scenarios": scenarios,
        "rounds": BENCHMARK_ROUNDS,
    }


@app.post("/api/visualize/{algo_name}")
def visualize_sort(algo_name: str, request: SortRequest):
    if algo_name not in SORTERS:
        raise HTTPException(status_code=404, detail="Algoritmo no registrado")

    steps = []
    start = time.perf_counter()
    arr = sort_data(algo_name, request.data, on_step=steps.append)
    duration = (time.perf_counter() - start) * 1000
    _, module = SORTERS[algo_name]
    source, map_source_line = get_display_source(module)
    for step in steps:
        direction = "next" if step["comparing"] else "previous" if step["swapping"] else "last"
        step["line"] = map_source_line(step["line"], direction)

    return {
        "algorithm": algo_name,
        "sorted_data": arr,
        "time_ms": round(duration, 4),
        "steps": steps,
        "source": source,
    }