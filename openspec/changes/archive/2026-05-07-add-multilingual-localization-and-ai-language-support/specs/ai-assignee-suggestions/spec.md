## ADDED Requirements

### Requirement: Locale-aware assignee suggestion narrative
The system SHALL generate `description` and `assignee_suggestions[].reason` values in the authenticated user’s saved locale while preserving response schema keys and data shape.

#### Scenario: Burmese locale assignee suggestions
- **WHEN** a user with saved locale `my-MM` requests AI issue suggestions
- **THEN** `description` and each suggestion `reason` are generated in Burmese
- **AND** response keys remain unchanged (`description`, `issue_type`, `priority`, `estimated_hours`, `assignee_suggestions`)

#### Scenario: Unsupported or missing locale falls back
- **WHEN** locale is missing or invalid for AI suggestion generation
- **THEN** the system instructs AI output in English

### Requirement: Issue type values remain user-defined and un-translated
The system SHALL keep `issue_type` constrained to the available project issue-type values exactly as provided and MUST NOT translate or normalize them.

#### Scenario: Custom issue type in non-English locale
- **WHEN** a project has custom issue type labels and a user requests AI suggestions in `vi-VN`
- **THEN** AI-selected `issue_type` matches one of the exact project-provided labels
- **AND** no translation is applied to the `issue_type` value
