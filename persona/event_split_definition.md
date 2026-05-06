# Simulated Event Split Definition

This document defines the time-based train/valid/test split generated from the simulated event log.

## Input

- `data/processed/simulated_events_test.csv`
- `data/processed/simulated_events.csv`

## Output

Test mode:
- `data/processed/train_events_test.csv`
- `data/processed/valid_events_test.csv`
- `data/processed/test_events_test.csv`
- `data/processed/event_split_summary_test.json`

Production mode:
- `data/processed/train_events.csv`
- `data/processed/valid_events.csv`
- `data/processed/test_events.csv`
- `data/processed/event_split_summary.json`

## Split Rule

- sort all events by `timestamp` ascending
- allocate the oldest 80% to `train`
- allocate the next 10% to `valid`
- allocate the newest 10% to `test`

## Notes

- the split is time-based rather than random
- the raw simulated event file remains local only
- the split summary JSON is used for quick inspection of row counts and event-type balance
