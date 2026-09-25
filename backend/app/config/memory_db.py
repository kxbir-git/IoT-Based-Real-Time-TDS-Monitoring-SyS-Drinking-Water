"""In-memory Mongo-like store used when MongoDB is unavailable."""
from __future__ import annotations

import copy
from datetime import datetime
from typing import Any, Optional

from bson import ObjectId


class _InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class MemoryCursor:
    def __init__(self, docs: list[dict], query: dict, sort: Optional[list] = None):
        self._docs = [copy.deepcopy(d) for d in docs if _matches(d, query)]
        self._sort = sort
        self._skip = 0
        self._limit: Optional[int] = None

    def sort(self, key_or_list, direction: int = -1):
        if isinstance(key_or_list, list):
            self._sort = key_or_list
        else:
            self._sort = [(key_or_list, direction)]
        return self

    def skip(self, n: int):
        self._skip = n
        return self

    def limit(self, n: int):
        self._limit = n
        return self

    def _apply(self) -> list[dict]:
        docs = self._docs
        if self._sort:
            for key, direction in reversed(self._sort):
                reverse = direction == -1
                docs = sorted(docs, key=lambda d: d.get(key) or datetime.min, reverse=reverse)
        if self._skip:
            docs = docs[self._skip :]
        if self._limit is not None:
            docs = docs[: self._limit]
        return docs

    def __iter__(self):
        return iter(self._apply())

    def __list__(self):
        return self._apply()


class MemoryCollection:
    def __init__(self):
        self._docs: list[dict] = []

    def create_index(self, *args, **kwargs):
        return None

    def insert_one(self, doc: dict):
        stored = copy.deepcopy(doc)
        stored.setdefault("_id", ObjectId())
        self._docs.append(stored)
        return _InsertResult(stored["_id"])

    def find_one(self, query: Optional[dict] = None, sort: Optional[list] = None):
        cursor = MemoryCursor(self._docs, query or {}, sort)
        if sort:
            cursor.sort(sort)
        docs = cursor._apply()
        return copy.deepcopy(docs[0]) if docs else None

    def find(self, query: Optional[dict] = None, sort: Optional[list] = None):
        cursor = MemoryCursor(self._docs, query or {}, sort)
        if sort:
            cursor.sort(sort)
        return cursor

    def count_documents(self, query: Optional[dict] = None) -> int:
        return len(list(MemoryCursor(self._docs, query or {})))

    def aggregate(self, pipeline: list[dict]):
        docs = [copy.deepcopy(d) for d in self._docs]
        for stage in pipeline:
            if "$group" in stage:
                spec = stage["$group"]
                if spec.get("_id") is None:
                    docs = [_group_all(docs, spec)]
        return docs


class MemoryDatabase:
    def __init__(self, name: str = "aquasense"):
        self.name = name
        self.users = MemoryCollection()
        self.readings = MemoryCollection()

    def __getitem__(self, name: str) -> MemoryCollection:
        if not hasattr(self, name):
            setattr(self, name, MemoryCollection())
        return getattr(self, name)


def _matches(doc: dict, query: dict) -> bool:
    if not query:
        return True
    for key, expected in query.items():
        actual = doc.get(key)
        if isinstance(expected, dict):
            if "$ne" in expected and actual == expected["$ne"]:
                return False
            if "$ne" in expected and expected["$ne"] == [] and actual == []:
                return False
            if "$ne" in expected:
                if actual == expected["$ne"]:
                    return False
                continue
        elif actual != expected:
            return False
    return True


def _eval_cond(doc: dict, cond: Any) -> int:
    # {"$cond": [{"$eq": ["$quality", "safe"]}, 1, 0]}
    if not isinstance(cond, list) or len(cond) != 3:
        return 0
    predicate, truthy, falsy = cond
    ok = False
    if isinstance(predicate, dict) and "$eq" in predicate:
        left, right = predicate["$eq"]
        left_val = doc.get(str(left).lstrip("$")) if isinstance(left, str) else left
        ok = left_val == right
    return truthy if ok else falsy


def _group_all(docs: list[dict], spec: dict) -> dict:
    out: dict[str, Any] = {"_id": None}
    for field, expr in spec.items():
        if field == "_id":
            continue
        if expr == {"$sum": 1}:
            out[field] = len(docs)
        elif isinstance(expr, dict) and "$avg" in expr:
            key = str(expr["$avg"]).lstrip("$")
            vals = [d.get(key, 0) or 0 for d in docs]
            out[field] = (sum(vals) / len(vals)) if vals else 0
        elif isinstance(expr, dict) and "$sum" in expr:
            inner = expr["$sum"]
            if inner == 1:
                out[field] = len(docs)
            elif isinstance(inner, dict) and "$cond" in inner:
                out[field] = sum(_eval_cond(d, inner["$cond"]) for d in docs)
            else:
                out[field] = 0
        else:
            out[field] = 0
    return out
