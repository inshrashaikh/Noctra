"""
Opening hours parsing and arrival-time evaluation engine for Noctra Essential Services.
Handles 24x7, single ranges, overnight midnight-crossing ranges, multiple intervals,
and weekday/weekend patterns in IST (+05:30).
"""

from __future__ import annotations
import re
from datetime import datetime, time, timedelta
from typing import Dict, List, Optional, Tuple, Any

DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
DAY_INDEX_MAP = {
    "mo": 0, "mon": 0, "monday": 0,
    "tu": 1, "tue": 1, "tuesday": 1,
    "we": 2, "wed": 2, "wednesday": 2,
    "th": 3, "thu": 3, "thursday": 3,
    "fr": 4, "fri": 4, "friday": 4,
    "sa": 5, "sat": 5, "saturday": 5,
    "su": 6, "sun": 6, "sunday": 6,
}


def parse_time_minutes(t_str: str) -> Optional[int]:
    """Parse 'HH:MM' into minutes from midnight (0..1439)."""
    t_str = t_str.strip()
    match = re.match(r"^(\d{1,2}):(\d{2})$", t_str)
    if not match:
        return None
    h = int(match.group(1))
    m = int(match.group(2))
    if 0 <= h <= 24 and 0 <= m < 60:
        if h == 24 and m == 0:
            return 1440
        return h * 60 + m
    return None


class TimeInterval:
    """Represents an open time interval in minutes from midnight."""
    def __init__(self, start_min: int, end_min: int, is_overnight: bool = False):
        self.start_min = start_min
        self.end_min = end_min
        self.is_overnight = is_overnight  # True if end_min is on the next calendar day


class OpeningSchedule:
    def __init__(self, is_24x7: bool = False, day_intervals: Optional[Dict[int, List[TimeInterval]]] = None, raw: Optional[str] = None):
        self.is_24x7 = is_24x7
        self.day_intervals = day_intervals or {i: [] for i in range(7)}
        self.raw = raw
        self.is_valid = is_24x7 or any(len(ints) > 0 for ints in self.day_intervals.values())


def parse_opening_hours(hours_raw: Optional[str]) -> OpeningSchedule:
    """
    Parse an opening hours string into an OpeningSchedule object.
    Supports:
    - '24/7', '00:00-24:00', '24 hours', 'Mo-Su 24/7'
    - '09:00-22:00', '08:00-22:30'
    - '19:00-03:30', '20:00-04:00' (overnight)
    - '08:00-14:00, 18:00-23:00' (multi-range)
    - 'Mo-Fr 08:00-20:00; Sa-Su 10:00-18:00'
    - None or unparseable -> empty schedule
    """
    if not hours_raw or not hours_raw.strip():
        return OpeningSchedule(is_24x7=False, raw=hours_raw)

    cleaned = hours_raw.strip().lower()

    # Check 24/7 variants
    if cleaned in ["24/7", "00:00-24:00", "24 hours", "open 24x7", "open 24×7", "mo-su 24/7"]:
        return OpeningSchedule(is_24x7=True, raw=hours_raw)

    schedule = OpeningSchedule(is_24x7=False, raw=hours_raw)

    # Check if string contains day specifications (e.g. 'Mo-Fr 08:00-20:00; Sa-Su 10:00-18:00')
    if ";" in cleaned or any(re.search(rf"\b{d}\b", cleaned) for d in ["mo", "tu", "we", "th", "fr", "sa", "su"]):
        sections = [s.strip() for s in hours_raw.split(";") if s.strip()]
        for sec in sections:
            _parse_day_section(sec, schedule.day_intervals)
    else:
        # Standard daily range or comma-separated ranges applied to all 7 days
        ranges = [r.strip() for r in hours_raw.split(",") if r.strip()]
        intervals = []
        for r_str in ranges:
            interval = _parse_range(r_str)
            if interval:
                intervals.append(interval)
        if intervals:
            for day in range(7):
                schedule.day_intervals[day].extend(intervals)

    schedule.is_valid = any(len(ints) > 0 for ints in schedule.day_intervals.values())
    return schedule


def _parse_range(r_str: str) -> Optional[TimeInterval]:
    match = re.search(r"(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})", r_str)
    if not match:
        return None
    start = parse_time_minutes(match.group(1))
    end = parse_time_minutes(match.group(2))
    if start is None or end is None:
        return None

    if end <= start:
        # Overnight range crossing midnight (e.g. 19:00 to 03:30)
        return TimeInterval(start_min=start, end_min=end, is_overnight=True)
    else:
        return TimeInterval(start_min=start, end_min=end, is_overnight=False)


def _parse_day_section(sec: str, day_intervals: Dict[int, List[TimeInterval]]):
    parts = sec.split(maxsplit=1)
    if len(parts) < 2:
        return
    day_spec, times_part = parts[0], parts[1]

    target_days: List[int] = []
    # Check range like Mo-Fr
    range_match = re.match(r"^([a-zA-Z]{2})\s*-\s*([a-zA-Z]{2})$", day_spec)
    if range_match:
        d1 = DAY_INDEX_MAP.get(range_match.group(1).lower())
        d2 = DAY_INDEX_MAP.get(range_match.group(2).lower())
        if d1 is not None and d2 is not None:
            if d1 <= d2:
                target_days = list(range(d1, d2 + 1))
            else:
                target_days = list(range(d1, 7)) + list(range(0, d2 + 1))
    else:
        # Comma separated individual days like Mo,We,Fr
        single_days = [d.strip().lower() for d in day_spec.split(",")]
        for sd in single_days:
            if sd in DAY_INDEX_MAP:
                target_days.append(DAY_INDEX_MAP[sd])

    if not target_days:
        target_days = list(range(7))

    ranges = [r.strip() for r in times_part.split(",") if r.strip()]
    for r_str in ranges:
        interval = _parse_range(r_str)
        if interval:
            for day in target_days:
                day_intervals[day].append(interval)


def evaluate_opening_status(
    hours_raw: Optional[str],
    arrival_time_min: int,  # minutes from midnight (0..1439)
    day_of_week: int = 0,   # 0=Monday .. 6=Sunday
    closing_soon_margin_min: int = 30,
    verified_hours: bool = False,
    verification_source: Optional[str] = None,
    source_class: str = "static",
    has_conflict: bool = False,
) -> Dict[str, Any]:
    """
    Evaluates opening status at arrival time with separate listing and opening evidence.
    Returns:
    - opening_status: 'OPEN_AT_ARRIVAL' | 'CLOSING_SOON' | 'CLOSED_AT_ARRIVAL' | 'OPENS_LATER' | 'UNKNOWN'
    - open_until: 'HH:MM' or None
    - opens_at: 'HH:MM' or None
    - opening_note: Human-readable note
    - opening_evidence: Dict
    """
    schedule = parse_opening_hours(hours_raw)

    # 1. Check Missing / Unparseable
    if not schedule.is_valid and not schedule.is_24x7:
        evidence = {
            "fact_type": "facility_hours",
            "subject": "opening_status",
            "label": "UNKNOWN",
            "confidence": 0.0,
            "age_s": 0.0,
            "source": "Unverified vendor record",
            "source_class": source_class,
            "simulated": source_class == "simulated",
            "reasons": ["Opening hours missing, unparseable, or informal street vendor"],
        }
        return {
            "opening_status": "UNKNOWN",
            "open_until": None,
            "opens_at": None,
            "opening_note": "Hours unverified / variable (never assumed open)",
            "opening_evidence": evidence,
        }

    # 2. Check 24/7
    if schedule.is_24x7:
        label = "KNOWN" if (verified_hours and verification_source) else "PROBABLE"
        confidence = 0.95 if label == "KNOWN" else 0.70
        reason = (
            f"Verified 24/7 service by {verification_source}"
            if label == "KNOWN"
            else "Published 24/7 schedule from static directory (unconfirmed live)"
        )
        if has_conflict:
            label = "OUTDATED"
            confidence = 0.40
            reason = "Conflicting opening hours reports in directory"

        evidence = {
            "fact_type": "facility_hours",
            "subject": "opening_status",
            "label": label,
            "confidence": confidence,
            "age_s": 3600.0 if label == "KNOWN" else 86400.0,
            "source": verification_source or "Published Directory Extract",
            "source_class": source_class,
            "simulated": source_class == "simulated",
            "reasons": [reason],
        }
        return {
            "opening_status": "OPEN_AT_ARRIVAL",
            "open_until": "24/7",
            "opens_at": None,
            "opening_note": "Open 24×7 throughout the night",
            "opening_evidence": evidence,
        }

    # 3. Time interval check:
    # A facility can be open at arrival_time_min due to:
    # a) An interval that started TODAY on day_of_week
    # b) An overnight interval that started YESTERDAY on (day_of_week - 1) % 7 and extends into today's early morning
    yesterday = (day_of_week - 1) % 7
    is_open = False
    closing_min = None
    opens_at_min = None

    # Check yesterday's overnight intervals
    for interval in schedule.day_intervals.get(yesterday, []):
        if interval.is_overnight:
            # Started yesterday, closes at interval.end_min today
            if arrival_time_min < interval.end_min:
                is_open = True
                closing_min = interval.end_min
                break

    # If not already open from yesterday's spillover, check today's intervals
    if not is_open:
        for interval in schedule.day_intervals.get(day_of_week, []):
            if interval.is_overnight:
                # Started today (e.g. 19:00), open if arrival >= start_min
                if arrival_time_min >= interval.start_min:
                    is_open = True
                    closing_min = interval.end_min + 1440  # tomorrow
                    break
            else:
                if interval.start_min <= arrival_time_min < interval.end_min:
                    is_open = True
                    closing_min = interval.end_min
                    break
                elif arrival_time_min < interval.start_min:
                    # Upcoming opening today
                    if opens_at_min is None or interval.start_min < opens_at_min:
                        opens_at_min = interval.start_min

    # If still not open and no upcoming opening today, check tomorrow's first opening
    if not is_open and opens_at_min is None:
        tomorrow = (day_of_week + 1) % 7
        for interval in schedule.day_intervals.get(tomorrow, []):
            candidate_open = interval.start_min + 1440
            if opens_at_min is None or candidate_open < opens_at_min:
                opens_at_min = candidate_open

    # Determine status & notes
    label = "KNOWN" if (verified_hours and verification_source) else "PROBABLE"
    confidence = 0.90 if label == "KNOWN" else 0.65
    reason = (
        f"Verified opening schedule by {verification_source}"
        if label == "KNOWN"
        else "Static published schedule (not live telemetry; PROBABLE at best)"
    )
    if has_conflict:
        label = "OUTDATED"
        confidence = 0.35
        reason = "Conflicting opening hours between sources"

    if is_open:
        # Check closing soon margin
        mins_left = (closing_min - arrival_time_min) if closing_min is not None else 999
        closing_time_str = _format_hhmm(closing_min % 1440 if closing_min is not None else 0)

        if mins_left <= closing_soon_margin_min:
            status = "CLOSING_SOON"
            note = f"Closing soon in {mins_left} min (at {closing_time_str})"
        else:
            status = "OPEN_AT_ARRIVAL"
            note = f"Open until {closing_time_str}"

        evidence = {
            "fact_type": "facility_hours",
            "subject": "opening_status",
            "label": label,
            "confidence": confidence,
            "age_s": 7200.0,
            "source": verification_source or "Static Directory",
            "source_class": source_class,
            "simulated": source_class == "simulated",
            "reasons": [reason],
        }
        return {
            "opening_status": status,
            "open_until": closing_time_str,
            "opens_at": None,
            "opening_note": note,
            "opening_evidence": evidence,
        }
    else:
        # Closed at arrival time
        opens_in_min = (opens_at_min - arrival_time_min) if opens_at_min is not None else 999
        opens_at_str = _format_hhmm(opens_at_min % 1440 if opens_at_min is not None else 0) if opens_at_min is not None else None

        # If it opens within early dawn window (e.g. within 150 minutes or by 06:00), mark OPENS_LATER
        if opens_at_min is not None and (opens_in_min <= 150 or (arrival_time_min >= 240 and opens_at_min <= 360)):
            status = "OPENS_LATER"
            note = f"Opens later at {opens_at_str} (in {opens_in_min} min)"
        else:
            status = "CLOSED_AT_ARRIVAL"
            note = f"Closed at arrival time" + (f" (opens at {opens_at_str})" if opens_at_str else "")

        evidence = {
            "fact_type": "facility_hours",
            "subject": "opening_status",
            "label": label,
            "confidence": confidence,
            "age_s": 7200.0,
            "source": verification_source or "Static Directory",
            "source_class": source_class,
            "simulated": source_class == "simulated",
            "reasons": [reason],
        }
        return {
            "opening_status": status,
            "open_until": None,
            "opens_at": opens_at_str,
            "opening_note": note,
            "opening_evidence": evidence,
        }


def _format_hhmm(minutes: int) -> str:
    h = (minutes // 60) % 24
    m = minutes % 60
    return f"{h:02d}:{m:02d}"
