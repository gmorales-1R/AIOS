"""Unit tests for tinkerbell's domain layer. Runs against a throwaway db/ dir via
TINKERBELL_DB_DIR so it never touches the real data.
"""

import os
import sys
import shutil
import tempfile
import unittest

CODE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "code")
REAL_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db")


class TinkerbellTestCase(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.mkdtemp(prefix="tinkerbell_test_")
        for name in ("tinkerbell.csv", "steps.csv", "log.csv", "counter.txt", "steps_counter.txt"):
            shutil.copy(os.path.join(REAL_DB_DIR, name), os.path.join(self.tmpdir, name))
        # tinkerbell.csv/log.csv are headers-only in the repo; make sure it stays that way
        # regardless of what the working tree currently has staged.
        with open(os.path.join(self.tmpdir, "tinkerbell.csv"), "w") as f:
            f.write("id,created_at,updated_at,type,title,content,tags,status,conclusion\n")
        with open(os.path.join(self.tmpdir, "steps.csv"), "w") as f:
            f.write("id,thought_id,seq,created_at,content\n")
        with open(os.path.join(self.tmpdir, "log.csv"), "w") as f:
            f.write("timestamp,table,operation,record_id,changed_by,detail\n")
        with open(os.path.join(self.tmpdir, "counter.txt"), "w") as f:
            f.write("0\n")
        with open(os.path.join(self.tmpdir, "steps_counter.txt"), "w") as f:
            f.write("0\n")

        os.environ["TINKERBELL_DB_DIR"] = self.tmpdir
        sys.path.insert(0, CODE_DIR)
        # store.py reads DB_DIR at import time, so purge any previously imported copy
        for mod in ("src.store", "src.thoughts", "src", "lib.render", "lib"):
            sys.modules.pop(mod, None)

        from src import thoughts as thoughts_mod
        self.thoughts = thoughts_mod

    def tearDown(self):
        sys.path.remove(CODE_DIR)
        shutil.rmtree(self.tmpdir, ignore_errors=True)
        os.environ.pop("TINKERBELL_DB_DIR", None)

    def test_capture_creates_open_thought(self):
        row = self.thoughts.capture("a raw idea", tags=["x"])
        self.assertEqual(row["type"], "capture")
        self.assertEqual(row["status"], "open")
        self.assertEqual(row["tags"], "x")

    def test_reason_creates_in_progress_thought(self):
        row = self.thoughts.reason("a hard question")
        self.assertEqual(row["type"], "reasoning")
        self.assertEqual(row["status"], "in_progress")

    def test_step_upgrades_capture_to_reasoning(self):
        row = self.thoughts.capture("started as a note")
        self.assertEqual(row["type"], "capture")
        step = self.thoughts.add_step(row["id"], "turns out this needs more thought")
        self.assertEqual(step["seq"], 1)
        thought, steps = self.thoughts.get(row["id"])
        self.assertEqual(thought["type"], "reasoning")
        self.assertEqual(thought["status"], "in_progress")
        self.assertEqual(len(steps), 1)

    def test_steps_are_ordered_by_seq(self):
        row = self.thoughts.reason("multi-step problem")
        self.thoughts.add_step(row["id"], "first")
        self.thoughts.add_step(row["id"], "second")
        self.thoughts.add_step(row["id"], "third")
        _, steps = self.thoughts.get(row["id"])
        self.assertEqual([s["content"] for s in steps], ["first", "second", "third"])
        self.assertEqual([s["seq"] for s in steps], [1, 2, 3])

    def test_resolve_sets_conclusion_and_status(self):
        row = self.thoughts.reason("question")
        resolved = self.thoughts.resolve(row["id"], "the answer")
        self.assertEqual(resolved["status"], "resolved")
        self.assertEqual(resolved["conclusion"], "the answer")

    def test_archive_sets_status(self):
        row = self.thoughts.capture("noise")
        archived = self.thoughts.archive(row["id"])
        self.assertEqual(archived["status"], "archived")

    def test_add_step_to_resolved_thought_raises(self):
        row = self.thoughts.reason("question")
        self.thoughts.resolve(row["id"], "answer")
        with self.assertRaises(ValueError):
            self.thoughts.add_step(row["id"], "too late")

    def test_get_unknown_id_raises_not_found(self):
        with self.assertRaises(self.thoughts.NotFound):
            self.thoughts.get(999)

    def test_list_filters_by_status_type_tag(self):
        a = self.thoughts.capture("a", tags=["work"])
        b = self.thoughts.reason("b", tags=["life"])
        self.thoughts.archive(a["id"])

        self.assertEqual([r["id"] for r in self.thoughts.list_thoughts(status="archived")], [a["id"]])
        self.assertEqual([r["id"] for r in self.thoughts.list_thoughts(type_="reasoning")], [b["id"]])
        self.assertEqual([r["id"] for r in self.thoughts.list_thoughts(tag="life")], [b["id"]])

    def test_search_matches_title_content_conclusion_and_steps(self):
        a = self.thoughts.capture("nothing special here", title="alpha")
        b = self.thoughts.reason("unrelated question", title="beta")
        self.thoughts.add_step(b["id"], "mentions the word needle")
        c = self.thoughts.reason("another one", title="gamma")
        self.thoughts.resolve(c["id"], "concludes with needle too")

        hits = {r["id"] for r in self.thoughts.search("needle")}
        self.assertEqual(hits, {b["id"], c["id"]})
        self.assertIn(a["id"], {r["id"] for r in self.thoughts.search("alpha")})

    def test_ids_are_never_reused(self):
        first = self.thoughts.capture("one")
        second = self.thoughts.capture("two")
        self.assertEqual(second["id"], first["id"] + 1)


if __name__ == "__main__":
    unittest.main()
