#!/usr/bin/env python3
"""tinkerbell CLI — capture raw thoughts, run reasoning chains, resolve them.

Usage:
  tinkerbell capture "content" [--title T] [--tags a,b]
  tinkerbell reason "problem statement" [--title T] [--tags a,b]
  tinkerbell step <id> "step content"
  tinkerbell resolve <id> "conclusion"
  tinkerbell archive <id>
  tinkerbell show <id>
  tinkerbell list [--status S] [--type T] [--tag TAG]
  tinkerbell search <query>
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src import thoughts
from lib import render


def _tags(arg):
    return [t.strip() for t in arg.split(",") if t.strip()] if arg else []


def main(argv=None):
    parser = argparse.ArgumentParser(prog="tinkerbell", description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("capture", help="log a raw thought")
    p.add_argument("content")
    p.add_argument("--title", default="")
    p.add_argument("--tags", default="")

    p = sub.add_parser("reason", help="open a reasoning chain")
    p.add_argument("problem")
    p.add_argument("--title", default="")
    p.add_argument("--tags", default="")

    p = sub.add_parser("step", help="add a reasoning step")
    p.add_argument("id", type=int)
    p.add_argument("content")

    p = sub.add_parser("resolve", help="resolve a thought with a conclusion")
    p.add_argument("id", type=int)
    p.add_argument("conclusion")

    p = sub.add_parser("archive", help="archive a thought")
    p.add_argument("id", type=int)

    p = sub.add_parser("show", help="show a thought and its steps")
    p.add_argument("id", type=int)

    p = sub.add_parser("list", help="list thoughts")
    p.add_argument("--status", default=None, choices=thoughts.STATUSES)
    p.add_argument("--type", dest="type_", default=None, choices=thoughts.TYPES)
    p.add_argument("--tag", default=None)

    p = sub.add_parser("search", help="search thoughts and steps")
    p.add_argument("query")

    args = parser.parse_args(argv)

    try:
        if args.command == "capture":
            row = thoughts.capture(args.content, title=args.title, tags=_tags(args.tags))
            print(f"captured #{row['id']}: {row['title']}")
        elif args.command == "reason":
            row = thoughts.reason(args.problem, title=args.title, tags=_tags(args.tags))
            print(f"opened reasoning #{row['id']}: {row['title']}")
        elif args.command == "step":
            step = thoughts.add_step(args.id, args.content)
            print(f"added step {step['seq']} to #{args.id}")
        elif args.command == "resolve":
            row = thoughts.resolve(args.id, args.conclusion)
            print(f"resolved #{row['id']}")
        elif args.command == "archive":
            row = thoughts.archive(args.id)
            print(f"archived #{row['id']}")
        elif args.command == "show":
            thought, steps = thoughts.get(args.id)
            print(render.format_thought_detail(thought, steps))
        elif args.command == "list":
            rows = thoughts.list_thoughts(status=args.status, type_=args.type_, tag=args.tag)
            print(render.format_list(rows))
        elif args.command == "search":
            rows = thoughts.search(args.query)
            print(render.format_list(rows))
    except thoughts.NotFound as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
