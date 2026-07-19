#!/usr/bin/env python3
"""tinkerbell MCP interface — a minimal, stdlib-only stdio JSON-RPC server speaking the
MCP surface (initialize / tools/list / tools/call) so agents can capture, reason about,
and query thoughts as tools. No `mcp` package dependency — hand-rolled to the subset of
the spec this needs: newline-delimited JSON-RPC 2.0 over stdio.

Run: python3 interfaces/mcp/server.py
"""

import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "code"))

from src import thoughts
from lib import render

PROTOCOL_VERSION = "2024-11-05"
SERVER_INFO = {"name": "tinkerbell", "version": "0.1.0"}

TOOLS = [
    {
        "name": "tinkerbell_capture",
        "description": "Log a raw thought (no reasoning chain attached yet).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "content": {"type": "string"},
                "title": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["content"],
        },
    },
    {
        "name": "tinkerbell_reason",
        "description": "Open a reasoning chain on a question or problem statement.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "problem": {"type": "string"},
                "title": {"type": "string"},
                "tags": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["problem"],
        },
    },
    {
        "name": "tinkerbell_step",
        "description": "Append a reasoning step to a thought. Auto-upgrades a capture to reasoning.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "content": {"type": "string"},
            },
            "required": ["id", "content"],
        },
    },
    {
        "name": "tinkerbell_resolve",
        "description": "Resolve a thought with a conclusion.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "conclusion": {"type": "string"},
            },
            "required": ["id", "conclusion"],
        },
    },
    {
        "name": "tinkerbell_archive",
        "description": "Archive a thought.",
        "inputSchema": {
            "type": "object",
            "properties": {"id": {"type": "integer"}},
            "required": ["id"],
        },
    },
    {
        "name": "tinkerbell_show",
        "description": "Show a thought and its reasoning steps in full.",
        "inputSchema": {
            "type": "object",
            "properties": {"id": {"type": "integer"}},
            "required": ["id"],
        },
    },
    {
        "name": "tinkerbell_list",
        "description": "List thoughts, optionally filtered by status, type, or tag.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": list(thoughts.STATUSES)},
                "type": {"type": "string", "enum": list(thoughts.TYPES)},
                "tag": {"type": "string"},
            },
        },
    },
    {
        "name": "tinkerbell_search",
        "description": "Full-text search across thought titles, content, conclusions, and steps.",
        "inputSchema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"],
        },
    },
]


def _text(s):
    return {"content": [{"type": "text", "text": s}]}


def call_tool(name, args):
    args = args or {}
    if name == "tinkerbell_capture":
        row = thoughts.capture(args["content"], title=args.get("title", ""), tags=args.get("tags", []))
        return _text(f"captured #{row['id']}: {row['title']}")
    if name == "tinkerbell_reason":
        row = thoughts.reason(args["problem"], title=args.get("title", ""), tags=args.get("tags", []))
        return _text(f"opened reasoning #{row['id']}: {row['title']}")
    if name == "tinkerbell_step":
        step = thoughts.add_step(args["id"], args["content"])
        return _text(f"added step {step['seq']} to #{args['id']}")
    if name == "tinkerbell_resolve":
        row = thoughts.resolve(args["id"], args["conclusion"])
        return _text(f"resolved #{row['id']}")
    if name == "tinkerbell_archive":
        row = thoughts.archive(args["id"])
        return _text(f"archived #{row['id']}")
    if name == "tinkerbell_show":
        thought, steps = thoughts.get(args["id"])
        return _text(render.format_thought_detail(thought, steps))
    if name == "tinkerbell_list":
        rows = thoughts.list_thoughts(status=args.get("status"), type_=args.get("type"), tag=args.get("tag"))
        return _text(render.format_list(rows))
    if name == "tinkerbell_search":
        rows = thoughts.search(args["query"])
        return _text(render.format_list(rows))
    raise thoughts.NotFound(f"no such tool: {name}")


def handle(msg):
    method = msg.get("method")
    msg_id = msg.get("id")

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {"tools": {}},
                "serverInfo": SERVER_INFO,
            },
        }
    if method == "notifications/initialized":
        return None
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": msg_id, "result": {"tools": TOOLS}}
    if method == "tools/call":
        params = msg.get("params", {})
        try:
            result = call_tool(params.get("name"), params.get("arguments"))
            return {"jsonrpc": "2.0", "id": msg_id, "result": result}
        except (thoughts.NotFound, ValueError, KeyError) as e:
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {"content": [{"type": "text", "text": f"error: {e}"}], "isError": True},
            }
    if method == "ping":
        return {"jsonrpc": "2.0", "id": msg_id, "result": {}}

    if msg_id is not None:
        return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": -32601, "message": f"method not found: {method}"}}
    return None


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue
        response = handle(msg)
        if response is not None:
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
