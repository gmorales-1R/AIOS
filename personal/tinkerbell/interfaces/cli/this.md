# tinkerbell/interfaces/cli

The CLI *is* `code/main.py` — no separate wrapper needed, since it has no state or presentation logic beyond what `main.py` already provides.

```
cd personal/tinkerbell/code
python3 main.py capture "content" [--title T] [--tags a,b]
python3 main.py reason "problem statement" [--title T] [--tags a,b]
python3 main.py step <id> "step content"
python3 main.py resolve <id> "conclusion"
python3 main.py archive <id>
python3 main.py show <id>
python3 main.py list [--status open|in_progress|resolved|archived] [--type capture|reasoning] [--tag TAG]
python3 main.py search <query>
```
