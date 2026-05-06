import ast
from pathlib import Path
from typing import Any


def _parse_scalar(raw_value: str) -> Any:
    value = raw_value.strip()
    if not value:
        return ""

    if value.startswith("[") and value.endswith("]"):
        return ast.literal_eval(value)

    if value.lower() == "true":
        return True
    if value.lower() == "false":
        return False

    try:
        return int(value)
    except ValueError:
        pass

    try:
        return float(value)
    except ValueError:
        pass

    return value.strip("\"'")


def _load_simple_yaml(path: Path) -> dict[str, Any]:
    root: dict[str, Any] = {}
    stack: list[tuple[int, dict[str, Any]]] = [(-1, root)]

    with path.open(encoding="utf-8") as infile:
        for raw_line in infile:
            if not raw_line.strip() or raw_line.lstrip().startswith("#"):
                continue

            indent = len(raw_line) - len(raw_line.lstrip(" "))
            line = raw_line.strip()
            if ":" not in line:
                continue

            key, raw_value = line.split(":", 1)
            key = key.strip()
            value = raw_value.strip()

            while stack and indent <= stack[-1][0]:
                stack.pop()

            current = stack[-1][1]
            if not value:
                nested: dict[str, Any] = {}
                current[key] = nested
                stack.append((indent, nested))
            else:
                current[key] = _parse_scalar(value)

    return root


def load_yaml_config(path: Path) -> dict[str, Any]:
    try:
        import yaml  # type: ignore
    except ModuleNotFoundError:
        return _load_simple_yaml(path)

    with path.open(encoding="utf-8") as infile:
        return yaml.safe_load(infile)
