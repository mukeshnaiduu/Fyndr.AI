from typing import List, Dict, Any, Tuple


def normalize_skills_field(raw_skills: List[Any]) -> Tuple[List[str], List[Dict[str, Any]]]:
    """Normalize a profile `skills` JSONField which may contain strings or skill objects.

    Returns a tuple: (names_list, detailed_list).
    - names_list: list[str] of skill names
    - detailed_list: list[dict] objects with keys {name, category, proficiency}

    If the input is already a list of strings, names_list will be that list and
    detailed_list will be empty.
    """
    names: List[str] = []
    detailed: List[Dict[str, Any]] = []
    if not raw_skills:
        return names, detailed
    for s in raw_skills:
        if isinstance(s, str):
            names.append(s)
        elif isinstance(s, dict):
            name = s.get('name') or s.get('skill') or ''
            if name:
                names.append(name)
                # Ensure canonical keys
                detailed.append({
                    'name': name,
                    'category': s.get('category') or s.get('group') or '',
                    'proficiency': s.get('proficiency') or s.get('level') or 'intermediate'
                })
    # dedupe names while preserving order
    seen = set()
    deduped_names = []
    for n in names:
        if n and n not in seen:
            deduped_names.append(n)
            seen.add(n)
    return deduped_names, detailed
