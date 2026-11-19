import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from algorithms.huffman import comprimir_huffman
from algorithms import BubbleSort, Exchange_sort, Gnome_sort, Insertion_sort
from algorithms import MergeSort, QuickSort, SelectionSort, StoogeSort


class HuffmanTests(unittest.TestCase):
    def test_round_trip_ascii(self):
        text = "abracadabra"
        metrics = comprimir_huffman(text)
        codes = metrics["codigos"]
        encoded = "".join(codes[ch] for ch in text)
        reverse = {code: ch for ch, code in codes.items()}

        decoded = []
        current = ""
        for bit in encoded:
            current += bit
            if current in reverse:
                decoded.append(reverse[current])
                current = ""

        self.assertEqual("".join(decoded), text)
        self.assertGreater(metrics["bits_comprimidos"], 0)
        self.assertLess(metrics["bits_comprimidos"], metrics["bits_originales"])

    def test_unicode_metrics_use_character_count(self):
        metrics = comprimir_huffman("áa")
        self.assertEqual(metrics["bits_originales"], 16)


class SorterTests(unittest.TestCase):
    def test_all_sorters_handle_duplicates_and_empty_input(self):
        sorters = (
            BubbleSort.bubble_sort,
            Exchange_sort.exchange_sort,
            Gnome_sort.gnome_sort,
            Insertion_sort.insertion_sort,
            MergeSort.merge_sort,
            QuickSort.quick_sort,
            SelectionSort.selection_sort,
            StoogeSort.stooge_sort,
        )
        cases = ([], [3], [3, 1, 3, 2, 1], [-2, 0, 5])
        for sorter in sorters:
            for data in cases:
                with self.subTest(sorter=sorter.__name__, data=data):
                    result = data.copy()
                    returned = sorter(result)
                    actual = result if returned is None else returned
                    self.assertEqual(actual, sorted(data))


class ClFormatTests(unittest.TestCase):
    def test_cl_layout_round_trip(self):
        text = "mañana"
        codes = comprimir_huffman(text)["codigos"]
        encoded = "".join(codes[ch] for ch in text)
        payload = bytearray()
        current = 0
        bit_count = 0
        for bit in encoded:
            current = (current << 1) | (1 if bit == "1" else 0)
            bit_count += 1
            if bit_count == 8:
                payload.append(current)
                current = 0
                bit_count = 0
        if bit_count:
            payload.append(current << (8 - bit_count))

        original_size = len(text)
        header = json.dumps(
            {"b": len(encoded), "o": original_size, "c": codes},
            ensure_ascii=False,
        ).encode("utf-8")
        archive = len(header).to_bytes(4, "little") + header + bytes(payload)

        header_length = int.from_bytes(archive[:4], "little")
        payload_start = 4 + header_length
        metadata = json.loads(archive[4:payload_start].decode("utf-8"))
        self.assertEqual(metadata["o"], original_size)
        valid_bits = metadata["b"]
        table_round_trip = metadata["c"]
        payload_round_trip = archive[payload_start:]
        reverse = {code: char for char, code in table_round_trip.items()}

        decoded = []
        current_code = ""
        consumed = 0
        for byte in payload_round_trip:
            for shift in range(7, -1, -1):
                if consumed >= valid_bits:
                    break
                current_code += "1" if (byte >> shift) & 1 else "0"
                consumed += 1
                if current_code in reverse:
                    decoded.append(reverse[current_code])
                    current_code = ""

        self.assertEqual("".join(decoded), text)
        self.assertEqual(consumed, len(encoded))
        self.assertEqual(current_code, "")


if __name__ == "__main__":
    unittest.main()
