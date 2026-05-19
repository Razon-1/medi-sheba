import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


PHONE_PATTERN = re.compile(r"^(?:\+?88)?01[3-9]\d{8}$")
PERSON_NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z .'-]*$")
PLACE_NAME_PATTERN = re.compile(r"^[A-Za-z][A-Za-z .'-]*$")
SPECIAL_CHARACTER_PATTERN = re.compile(r"[^A-Za-z0-9]")


def normalize_phone_number(value):
    """Return a compact Bangladesh mobile number while accepting common separators."""
    if value is None:
        return value

    compact = re.sub(r"[\s\-().]", "", str(value).strip())
    if compact.startswith("0088"):
        compact = compact[2:]
    return compact


def validate_bangladesh_phone_number(value):
    compact = normalize_phone_number(value)
    if not compact or not PHONE_PATTERN.fullmatch(compact):
        raise ValidationError(
            _("Enter a valid Bangladesh mobile number, e.g. 01712345678 or +8801712345678."),
            code="invalid_phone_number",
        )


def validate_gmail_address(value):
    email = (value or "").strip().lower()
    if not email.endswith("@gmail.com"):
        raise ValidationError(
            _("Only Gmail addresses are allowed for user accounts."),
            code="invalid_gmail_address",
        )


def validate_person_name(value):
    name = (value or "").strip()
    if not name:
        raise ValidationError(_("This field is required."), code="required")
    if len(name) > 100:
        raise ValidationError(_("Name must be 100 characters or fewer."), code="max_length")
    if not PERSON_NAME_PATTERN.fullmatch(name):
        raise ValidationError(
            _("Name can contain only letters, spaces, periods, apostrophes, and hyphens."),
            code="invalid_name",
        )


def validate_place_name(value):
    place = (value or "").strip()
    if not place:
        return
    if len(place) > 100:
        raise ValidationError(_("This field must be 100 characters or fewer."), code="max_length")
    if not PLACE_NAME_PATTERN.fullmatch(place):
        raise ValidationError(
            _("This field can contain only letters, spaces, periods, apostrophes, and hyphens."),
            code="invalid_place_name",
        )


def validate_strong_password(value):
    password = value or ""
    errors = []

    if len(password) < 8:
        errors.append(_("Password must be at least 8 characters long."))
    if not any(char.isupper() for char in password):
        errors.append(_("Password must include at least one uppercase letter."))
    if not any(char.islower() for char in password):
        errors.append(_("Password must include at least one lowercase letter."))
    if not any(char.isdigit() for char in password):
        errors.append(_("Password must include at least one number."))
    if not SPECIAL_CHARACTER_PATTERN.search(password):
        errors.append(_("Password must include at least one special character."))

    if errors:
        raise ValidationError(errors, code="weak_password")
