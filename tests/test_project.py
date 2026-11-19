import json
import sys
import unittest
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from algorithms.huffman import build_huffman_tree, comprimir_huffman, generar_codigos
from algorithms import BubbleSort, Exchange_sort, Gnome_sort, Insertion_sort
from algorithms import MergeSort, QuickSort, SelectionSort, StoogeSort


class HuffmanTests(unittest.TestCase):
    def test_round_trip_ascii(self):
        text = "abracadabra"
        _, codes = build_huffman_tree(text)
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
        metrics = comprimir_huffman(text)
        self.assertGreater(metrics["bits_comprimidos"], 0)
        self.assertLess(metrics["bits_comprimidos"], metrics["bits_originales"])

    def test_unicode_metrics_use_utf8_bytes(self):
        metrics = comprimir_huffman("áa")
        self.assertEqual(metrics["bits_originales"], 24)


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


class IntegrityFormatTests(unittest.TestCase):
    def test_cl_layout_round_trip_and_crc(self):
        text = "banana"
        _, codes = build_huffman_tree(text)
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

        table = json.dumps(codes, ensure_ascii=False).encode("utf-8")
        original = text.encode("utf-8")
        body = (
            b"CLHUFF1"
            + len(original).to_bytes(4, "big")
            + len(encoded).to_bytes(4, "big")
            + len(table).to_bytes(4, "big")
            + table
            + bytes(payload)
        )
        archive = body + zlib.crc32(body).to_bytes(4, "big")

        self.assertEqual(archive[:7], b"CLHUFF1")
        self.assertEqual(int.from_bytes(archive[7:11], "big"), len(original))
        valid_bits = int.from_bytes(archive[11:15], "big")
        table_length = int.from_bytes(archive[15:19], "big")
        table_round_trip = json.loads(archive[19:19 + table_length].decode("utf-8"))
        payload_start = 19 + table_length
        payload_round_trip = archive[payload_start:-4]
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
        self.assertEqual(zlib.crc32(body), int.from_bytes(archive[-4:], "big"))


if __name__ == "__main__":
    unittest.main()
