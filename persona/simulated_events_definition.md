# simulated_events definition

## Purpose

`simulated_events` is the persona-driven synthetic event log used for later
recommendation and simulator experiments.

## Inputs

- `data/processed/sim_users_test.csv`
- `data/processed/item_master_test.csv`
- `data/processed/item_persona_scores_test.csv`
- `simulator/persona_config_9.yaml`

## Outputs

- test mode: `data/processed/simulated_events_test.csv`
- production mode: `data/processed/simulated_events.csv`

## Output columns

- `event_id`
- `timestamp`
- `user_id`
- `session_id`
- `event_type`
- `query_text`
- `article_id`
- `active_persona`
- `top_persona`
- `category_l1`
- `category_l2`
- `category_l3`
- `colour_group_name`
- `price_mean`
- `price_bucket`

## Event policy

- supported event types:
  - `search`
  - `view`
  - `cart`
  - `purchase`
- each session selects one active persona using the user's persona ratios
- items are sampled from persona-aligned item pools
- query text is generated from persona category/color preferences

## Scale

- test mode uses a smaller target event count
- production mode targets `1,000,000` events
