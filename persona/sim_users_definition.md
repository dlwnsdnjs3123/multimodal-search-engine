# sim_users definition

## Purpose

`sim_users` is a sampled simulator user pool built from `user_persona_scores`
and `customer_purchase_profile`.

It is used for:

- simulator session user sampling
- persona-driven session generation
- lightweight user metadata lookup during event generation

## Inputs

- `data/processed/user_persona_scores_test.csv`
- `data/processed/customer_purchase_profile_test.csv`
- `simulator/persona_config_9.yaml`

## Outputs

- test mode: `data/processed/sim_users_test.csv`
- production mode: `data/processed/sim_users.csv`

## Output columns

- `user_id`
- `age`
- `age_bucket`
- `fashion_news_frequency`
- `club_member_status`
- `top_persona`
- `top_persona_ratio`
- `trendsetter_ratio`
- `practical_ratio`
- `value_ratio`
- `brand_loyal_ratio`
- `impulse_ratio`
- `careful_ratio`
- `repeat_stable_ratio`
- `color_focus_ratio`
- `category_focus_ratio`

## Sampling policy

- source rows come from `user_persona_scores`
- rows are joined with `customer_purchase_profile`
- sampled user count follows `simulation.user_pool_size`
- test mode may downscale if available users are fewer than the configured pool size

## Notes

- `user_id` is the original `customer_id`
- ratio columns must sum to `1.0`
