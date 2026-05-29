"""
Outfit Recommendation Engine — Core Orchestrator.

Combines color, category, weather, occasion, and condition rules
to generate scored outfit recommendations from a user's wardrobe.
"""

import logging
from typing import List, Optional, Dict, Any

from app.recommendations.color_rules import get_color_score, get_avoid_color_reason
from app.recommendations.category_rules import (
    get_category_score,
    get_outfit_role,
    infer_category_from_type,
)
from app.recommendations.weather_rules import (
    get_weather_score,
    get_weather_avoid_reasons,
)
from app.recommendations.occasion_rules import (
    get_occasion_score,
    get_occasion_tag,
)

logger = logging.getLogger(__name__)

# ─── Score Weights ────────────────────────────────────────────────────
WEIGHT_COLOR = 35
WEIGHT_CATEGORY = 25
WEIGHT_OCCASION = 15
WEIGHT_WEATHER = 15
WEIGHT_CONDITION = 10

# ─── Condition Scores ────────────────────────────────────────────────
CONDITION_SCORES: dict[str, float] = {
    "New":           1.0,
    "Good":          0.9,
    "Faded":         0.5,
    "Needs Washing": 0.4,
    "Damaged":       0.0,  # Excluded
    "Needs Repair":  0.0,  # Excluded
}

EXCLUDED_CONDITIONS = {"Damaged", "Needs Repair"}

# ─── Women-Specific Styling Rules ─────────────────────────────────────
LIPSTICK_RULES: dict[str, list[str]] = {
    "Red":    ["Nude brown", "Soft red", "Peach"],
    "Black":  ["Red", "Nude", "Wine"],
    "Pink":   ["Nude pink", "Peach"],
    "Green":  ["Nude", "Brown", "Peach"],
    "Blue":   ["Peach", "Nude pink", "Coral"],
    "White":  ["Red", "Pink", "Nude"],
    "Beige":  ["Nude brown", "Soft pink", "Mauve"],
    "Yellow": ["Coral", "Peach", "Nude"],
    "Brown":  ["Nude brown", "Mauve", "Berry"],
    "Maroon": ["Nude", "Berry", "Burgundy"],
    "Navy":   ["Red", "Nude", "Coral"],
}

WOMEN_ACCESSORY_RULES: dict[str, list[str]] = {
    "Red":    ["Gold hoops", "Minimal chain", "Clutch"],
    "Black":  ["Silver jewelry", "Statement earrings", "Leather bag"],
    "Pink":   ["Delicate jewelry", "Pearl studs", "Mini bag"],
    "Green":  ["Gold accessories", "Tan leather bag", "Wooden bangles"],
    "Blue":   ["Silver jewelry", "White bag", "Stud earrings"],
    "White":  ["Gold jewelry", "Colorful scarf", "Tote bag"],
    "Beige":  ["Gold accessories", "Leather bag", "Layered chains"],
    "Brown":  ["Gold jewelry", "Cream scarf", "Leather belt"],
}

WOMEN_FOOTWEAR_RULES: dict[str, list[str]] = {
    "Red":    ["Black heels", "Nude sandals", "White sneakers"],
    "Black":  ["Black heels", "Silver footwear", "White sneakers"],
    "Pink":   ["White sneakers", "Beige heels", "Nude sandals"],
    "Green":  ["Beige heels", "Brown sandals", "White sneakers"],
    "Blue":   ["White sneakers", "Nude heels", "Brown loafers"],
    "White":  ["Any color heels", "Sneakers", "Nude sandals"],
    "Beige":  ["Brown heels", "White sneakers", "Black loafers"],
}


def _get_condition_score(condition: Optional[str]) -> float:
    """Return a normalized condition score (0.0–1.0)."""
    if not condition:
        return 0.7  # Unknown condition, assume decent
    return CONDITION_SCORES.get(condition.strip().title(), 0.7)


def _should_exclude(item: dict) -> bool:
    """Check if an item should be excluded from recommendations."""
    if item.get("is_deleted"):
        return True
    condition = (item.get("condition") or "").strip().title()
    return condition in EXCLUDED_CONDITIONS


def _compute_item_score(
    selected_item: dict,
    candidate: dict,
    occasion: Optional[str],
    weather: Optional[str],
) -> tuple[float, list[str]]:
    """
    Compute a composite score (0–100) for a candidate item
    relative to a selected anchor item.
    
    Returns (score, list_of_match_reason_tags).
    """
    tags: list[str] = []

    # 1. Color compatibility (35 pts)
    color_score = get_color_score(
        selected_item.get("primary_color", ""),
        candidate.get("primary_color", ""),
    )
    color_points = color_score * WEIGHT_COLOR
    if color_score >= 0.7:
        tags.append("Color Compatible")

    # 2. Category compatibility (25 pts)
    cat_score = get_category_score(
        selected_item.get("category", ""),
        candidate.get("category", ""),
    )
    cat_points = cat_score * WEIGHT_CATEGORY

    # 3. Occasion match (15 pts)
    occ_score = get_occasion_score(
        occasion or "",
        candidate.get("type", ""),
        candidate.get("category", ""),
    )
    occ_points = occ_score * WEIGHT_OCCASION
    if occ_score >= 0.7 and occasion:
        occ_tag = get_occasion_tag(occasion)
        if occ_tag:
            tags.append(occ_tag)

    # 4. Weather suitability (15 pts)
    weather_score = get_weather_score(
        weather or "mild",
        candidate.get("type", ""),
        candidate.get("material"),
        candidate.get("primary_color"),
        candidate.get("category"),
    )
    weather_points = weather_score * WEIGHT_WEATHER
    if weather_score >= 0.7 and weather and weather.lower() not in ("mild", "all-season"):
        tags.append("Weather Safe")

    # 5. Condition (10 pts)
    cond_score = _get_condition_score(candidate.get("condition"))
    cond_points = cond_score * WEIGHT_CONDITION
    if cond_score >= 0.9:
        tags.append("Good Condition")

    total = color_points + cat_points + occ_points + weather_points + cond_points

    if total >= 75:
        tags.insert(0, "Best Match")

    return round(total, 1), tags


def _item_to_summary(item: dict) -> dict:
    """Convert a raw item dict to a lean summary for the response."""
    return {
        "id": str(item.get("id", "")),
        "type": item.get("type", ""),
        "category": item.get("category", ""),
        "primary_color": item.get("primary_color", ""),
        "secondary_color": item.get("secondary_color"),
        "brand": item.get("brand"),
        "material": item.get("material"),
        "season": item.get("season"),
        "condition": item.get("condition"),
        "front_image_key": item.get("front_image_key", ""),
    }


def _get_women_styling(primary_color: str) -> dict:
    """Return women-specific styling suggestions based on the outfit's primary color."""
    normalized = (primary_color or "").strip().title()
    return {
        "lipstick_suggestion": LIPSTICK_RULES.get(normalized, ["Nude", "Peach"]),
        "footwear_type_suggestion": WOMEN_FOOTWEAR_RULES.get(normalized, ["Sneakers", "Heels"]),
        "accessory_suggestion": WOMEN_ACCESSORY_RULES.get(normalized, ["Minimal jewelry", "Tote bag"]),
    }


def generate_recommendation(
    wardrobe_items: List[dict],
    selected_item_id: Optional[str] = None,
    occasion: Optional[str] = None,
    weather: Optional[str] = None,
    gender_style: Optional[str] = None,
    preferred_type: Optional[str] = None,
    user_gender_preference: Optional[str] = None,
) -> dict:
    """
    Generate an outfit recommendation from the user's wardrobe.
    
    Returns a structured dict with:
    - selected_item, best_top_matches, best_bottom_matches,
      best_footwear_matches, accessories_suggestions,
      avoid_combinations, explanation, outfit_score,
      and optional women-specific suggestions.
    """
    # Filter out deleted and damaged items
    active_items = [i for i in wardrobe_items if not _should_exclude(i)]

    if len(active_items) < 2:
        return {
            "selected_item": None,
            "best_top_matches": [],
            "best_bottom_matches": [],
            "best_footwear_matches": [],
            "accessories_suggestions": [],
            "avoid_combinations": [],
            "explanation": "Add more clothing items to your wardrobe to get better outfit recommendations. You need at least 2 active items.",
            "outfit_score": 0,
            "insufficient_wardrobe": True,
        }

    # ─── Find the selected / anchor item ──────────────────────────
    selected = None
    if selected_item_id:
        for item in active_items:
            if str(item.get("id")) == selected_item_id:
                selected = item
                break
    
    if not selected and preferred_type:
        # Pick the best-condition item matching preferred_type
        typed = [i for i in active_items if (i.get("type") or "").lower() == preferred_type.lower()]
        if typed:
            typed.sort(key=lambda i: _get_condition_score(i.get("condition")), reverse=True)
            selected = typed[0]

    if not selected:
        # Pick the first top-wear item in good condition, or just the first item
        tops = [i for i in active_items if get_outfit_role(i.get("category", "")) == "top"]
        if tops:
            tops.sort(key=lambda i: _get_condition_score(i.get("condition")), reverse=True)
            selected = tops[0]
        else:
            selected = active_items[0]

    # ─── Score all candidates against the selected item ───────────
    candidates = [i for i in active_items if str(i.get("id")) != str(selected.get("id"))]

    scored: list[tuple[dict, float, list[str]]] = []
    for candidate in candidates:
        score, tags = _compute_item_score(selected, candidate, occasion, weather)
        scored.append((candidate, score, tags))

    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)

    # ─── Bucket by outfit role ────────────────────────────────────
    top_matches = []
    bottom_matches = []
    footwear_matches = []
    accessory_matches = []

    for item, score, tags in scored:
        role = get_outfit_role(item.get("category", ""))
        entry = {
            **_item_to_summary(item),
            "match_score": score,
            "match_reasons": tags,
        }
        if role == "top" or role == "layering":
            top_matches.append(entry)
        elif role == "bottom":
            bottom_matches.append(entry)
        elif role == "footwear":
            footwear_matches.append(entry)
        elif role == "accessory":
            accessory_matches.append(entry)
        else:
            # Unknown role — try to infer
            inferred_cat = infer_category_from_type(item.get("type", ""))
            inferred_role = get_outfit_role(inferred_cat)
            if inferred_role == "bottom":
                bottom_matches.append(entry)
            elif inferred_role == "footwear":
                footwear_matches.append(entry)
            else:
                top_matches.append(entry)

    # ─── Build avoid combinations ─────────────────────────────────
    avoid_list: list[dict] = []
    
    for item, score, tags in scored:
        # Color clashes
        reason = get_avoid_color_reason(
            selected.get("primary_color", ""),
            item.get("primary_color", ""),
        )
        if reason:
            avoid_list.append({
                "item": _item_to_summary(item),
                "reason": reason,
            })

        # Weather avoids
        if weather:
            weather_reasons = get_weather_avoid_reasons(
                weather,
                item.get("type", ""),
                item.get("material"),
                item.get("primary_color"),
                item.get("category"),
            )
            for wr in weather_reasons:
                avoid_list.append({
                    "item": _item_to_summary(item),
                    "reason": wr,
                })

    # Deduplicate avoid by item ID
    seen_avoid_ids: set = set()
    unique_avoids: list[dict] = []
    for av in avoid_list:
        aid = av["item"]["id"]
        if aid not in seen_avoid_ids:
            seen_avoid_ids.add(aid)
            unique_avoids.append(av)

    # ─── Compute overall outfit score ─────────────────────────────
    best_scores = []
    if bottom_matches:
        best_scores.append(bottom_matches[0]["match_score"])
    if footwear_matches:
        best_scores.append(footwear_matches[0]["match_score"])
    if top_matches and get_outfit_role(selected.get("category", "")) != "top":
        best_scores.append(top_matches[0]["match_score"])

    outfit_score = round(sum(best_scores) / max(len(best_scores), 1), 1) if best_scores else 0

    # ─── Build explanation ────────────────────────────────────────
    explanation_parts = []
    sel_color = selected.get("primary_color", "unknown")
    sel_type = selected.get("type", "item")

    explanation_parts.append(f"Starting with your {sel_color} {sel_type}.")

    if bottom_matches:
        best_b = bottom_matches[0]
        explanation_parts.append(
            f"Best bottom match: {best_b['primary_color']} {best_b['type']} "
            f"(score: {best_b['match_score']}/100)."
        )

    if footwear_matches:
        best_f = footwear_matches[0]
        explanation_parts.append(
            f"Best footwear: {best_f['primary_color']} {best_f['type']} "
            f"(score: {best_f['match_score']}/100)."
        )

    if occasion:
        explanation_parts.append(f"Filtered for {occasion.lower()} occasion.")

    if weather and weather.lower() not in ("mild", "all-season"):
        explanation_parts.append(f"Optimized for {weather.lower()} weather conditions.")

    if unique_avoids:
        explanation_parts.append(f"Found {len(unique_avoids)} combination(s) to avoid.")

    explanation = " ".join(explanation_parts)

    # ─── Women-specific styling ───────────────────────────────────
    is_women = False
    if gender_style and gender_style.lower() == "women":
        is_women = True
    elif user_gender_preference and user_gender_preference.lower() == "women":
        is_women = True
    elif selected.get("gender_fit") and selected["gender_fit"].lower() == "women":
        is_women = True

    result = {
        "selected_item": {
            **_item_to_summary(selected),
            "match_score": 100,
            "match_reasons": ["Selected Item"],
        },
        "best_top_matches": top_matches[:5],
        "best_bottom_matches": bottom_matches[:5],
        "best_footwear_matches": footwear_matches[:5],
        "accessories_suggestions": accessory_matches[:5],
        "avoid_combinations": unique_avoids[:5],
        "explanation": explanation,
        "outfit_score": outfit_score,
        "insufficient_wardrobe": False,
    }

    if is_women:
        women_styling = _get_women_styling(sel_color)
        result["lipstick_suggestion"] = women_styling["lipstick_suggestion"]
        result["footwear_type_suggestion"] = women_styling["footwear_type_suggestion"]
        result["accessory_suggestion"] = women_styling["accessory_suggestion"]

    return result
