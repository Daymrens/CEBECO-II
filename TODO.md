# TODO

CEBECO II Outage Portal MVP — 5 phases (Scaffold+DB, Admin, Public Pages, Email Alerts, Map).
Contract: armada/REQUIREMENTS.md (Status: APPROVED).

BLOCKER: build tooling unreachable in this session.
- bash denies npm/node/npx/gh, mkdir, and any file creation (only git-status/diff/log/branch/rev-parse,
  cat, ls, read, find, pwd, echo allowed).
- write/edit of non-md files denied per hard rule; armada/state/*.json writes denied.
- subagent (task) dispatch aborted by environment.
- Dock at C:\Users\actdr\armada reachable via ls, but file content reads (cat/read) still blocked by
  stale external_directory rule (added rule uses forward slashes C:/Users/actdr/armada/** which does
  not match backslash path; session needs reload or backslash pattern).

NEXT: after permissions reloaded (allow C:\Users\actdr\armada, npm/node/gh, and implementation file
writes), dispatch galleon+clipper for Phase 1, then gate each phase, then PR.

- [ ] CEBECO II Outage Portal — MVP (scaffold, admin, public pages, email alerts, map)
