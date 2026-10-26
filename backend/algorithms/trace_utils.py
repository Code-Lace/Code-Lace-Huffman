import ast
import inspect
import textwrap


def get_display_source(module):
    module_source = inspect.getsource(module)
    source_lines = module_source.splitlines()
    syntax_tree = ast.parse(module_source)
    functions = [
        node for node in syntax_tree.body
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    ]
    core_function = max(
        functions,
        key=lambda function: sum(
            isinstance(node, (ast.If, ast.For, ast.While, ast.Assign, ast.AugAssign))
            for node in ast.walk(function)
        ),
    )
    core_lines = set(range(core_function.lineno, core_function.end_lineno + 1))
    hidden_lines = set(range(1, len(source_lines) + 1)) - core_lines
    hidden_lines.add(core_function.lineno)

    first_statement = core_function.body[0] if core_function.body else None
    if (
        isinstance(first_statement, ast.Expr)
        and isinstance(first_statement.value, ast.Constant)
        and isinstance(first_statement.value.value, str)
    ):
        hidden_lines.update(range(first_statement.lineno, first_statement.end_lineno + 1))
    hidden_parameters = {"on_step", "offset", "visual_values"}
    function_parameters = {
        node.name: [argument.arg for argument in node.args.args]
        for node in ast.walk(syntax_tree)
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
    }

    def is_instrumentation_target(target):
        if isinstance(target, ast.Name):
            return target.id in {"sorted_indices", "visual_values"}
        return (
            isinstance(target, ast.Subscript)
            and isinstance(target.value, ast.Name)
            and target.value.id == "visual_values"
        )

    def remove_arguments(line, arguments, removed_indices, end_positions=None):
        ranges = []
        for argument_index in removed_indices:
            if argument_index > 0:
                start = arguments[argument_index - 1].end_col_offset
                end = end_positions[argument_index]
            elif argument_index + 1 < len(arguments):
                start = arguments[argument_index].col_offset
                end = arguments[argument_index + 1].col_offset
            else:
                start = arguments[argument_index].col_offset
                end = end_positions[argument_index]
            ranges.append((start, end))

        for start, end in sorted(ranges, reverse=True):
            line = line[:start] + line[end:]
        return line

    for node in ast.walk(syntax_tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            hidden_lines.update(range(node.lineno, node.end_lineno + 1))
        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            call = node.value
            if isinstance(call.func, ast.Name) and call.func.id == "record_step":
                hidden_lines.update(range(node.lineno, node.end_lineno + 1))
            elif (
                isinstance(call.func, ast.Attribute)
                and call.func.attr == "append"
                and isinstance(call.func.value, ast.Name)
                and call.func.value.id == "sorted_indices"
            ):
                hidden_lines.update(range(node.lineno, node.end_lineno + 1))
        elif isinstance(node, ast.Assign) and any(
            is_instrumentation_target(target) for target in node.targets
        ):
            hidden_lines.update(range(node.lineno, node.end_lineno + 1))
        elif (
            isinstance(node, ast.If)
            and not node.orelse
            and len(node.body) == 1
            and isinstance(node.body[0], ast.Expr)
            and isinstance(node.body[0].value, ast.Call)
            and isinstance(node.body[0].value.func, ast.Name)
            and node.body[0].value.func.id == "record_step"
        ):
            hidden_lines.update(range(node.lineno, node.end_lineno + 1))

    for node in ast.walk(syntax_tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            arguments = node.args.args
            removed_indices = [
                index for index, argument in enumerate(arguments)
                if argument.arg in hidden_parameters
            ]
            if removed_indices:
                end_positions = [argument.end_col_offset for argument in arguments]
                default_start = len(arguments) - len(node.args.defaults)
                for index, default in enumerate(node.args.defaults, start=default_start):
                    end_positions[index] = default.end_col_offset
                source_lines[node.lineno - 1] = remove_arguments(
                    source_lines[node.lineno - 1], arguments, removed_indices, end_positions
                )
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            parameters = function_parameters.get(node.func.id, [])
            removed_indices = [
                index for index, parameter in enumerate(parameters)
                if parameter in hidden_parameters and index < len(node.args)
            ]
            if removed_indices:
                end_positions = [argument.end_col_offset for argument in node.args]
                source_lines[node.lineno - 1] = remove_arguments(
                    source_lines[node.lineno - 1], node.args, removed_indices, end_positions
                )

    visible_source = []
    visible_source_lines = []
    for source_line_number, source_line in enumerate(source_lines, start=1):
        if source_line_number not in hidden_lines:
            visible_source.append(source_line)
            visible_source_lines.append(source_line_number)

    while visible_source and not visible_source[0].strip():
        visible_source.pop(0)
        visible_source_lines.pop(0)
    while visible_source and not visible_source[-1].strip():
        visible_source.pop()
        visible_source_lines.pop()

    visible_source = textwrap.dedent("\n".join(visible_source)).splitlines()

    source_line_map = {
        source_line_number: index + 1
        for index, source_line_number in enumerate(visible_source_lines)
    }

    def visible_line(source_line_number, direction):
        exact = source_line_map.get(source_line_number)
        if exact and source_lines[source_line_number - 1].strip():
            return exact

        if direction in ("next", "last"):
            candidates = [
                line for line in visible_source_lines
                if line > source_line_number
                and source_lines[line - 1].strip()
                and not source_lines[line - 1].lstrip().startswith("#")
            ]
            if candidates:
                return source_line_map[candidates[0]]
        if direction in ("previous", "last"):
            candidates = [
                line for line in visible_source_lines
                if line < source_line_number
                and source_lines[line - 1].strip()
                and not source_lines[line - 1].lstrip().startswith("#")
            ]
            if candidates:
                return source_line_map[candidates[-1]]
        return 1

    return visible_source, visible_line


def record_step(on_step, values, comparing=(), swapping=(), sorted_indices=()):
    if on_step is None:
        return

    caller = inspect.currentframe().f_back
    on_step({
        "array": list(values),
        "comparing": list(comparing),
        "swapping": list(swapping),
        "sorted": list(sorted_indices),
        "line": caller.f_lineno if caller else 1,
    })