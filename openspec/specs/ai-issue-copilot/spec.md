## MODIFIED Requirements

### Requirement: AI Issue Field Suggestion
The system SHALL provide an AI-driven mechanism to suggest issue fields (Summary, Description, Type, Priority, Estimate, Assignee Suggestions, Due Date, and Milestone) based on a provided source prompt and project context, using the configured chat completion abstraction that supports OpenRouter direct HTTP calls. The source prompt MAY be a natural-language brief, bug report, copied chat history, support note, meeting excerpt, or mixed-language text. The system SHALL populate untouched fields in the create issue form without overwriting existing non-blank user input. Fields whose current value is null, an empty string, or whitespace-only SHALL be treated as fillable even if the user previously touched them.

#### Scenario: User generates an issue draft from a source prompt
- **WHEN** a user enters a source prompt and clicks the "Generate draft" action
- **THEN** the system requests AI suggestions through the chat completion abstraction and populates empty or untouched fields in the create issue form without overwriting existing user input.

#### Scenario: Source prompt generates a summary
- **WHEN** the AI suggestion request succeeds for a source prompt
- **THEN** the response includes a suggested issue summary suitable for the issue summary input.

#### Scenario: User-edited fields are preserved
- **WHEN** a user has manually edited an issue field before generating an AI draft
- **AND** the current field value is non-blank
- **THEN** the generated draft does not overwrite that field.

#### Scenario: User-cleared fields are filled
- **WHEN** a user has manually edited an issue field and then clears it to null, an empty string, or whitespace-only before generating an AI draft
- **THEN** the generated draft MAY populate that field from the AI suggestion.

#### Scenario: JSON-mode fallback for unsupported models
- **WHEN** the first suggestion request using strict JSON response mode fails due to model capability limits
- **THEN** the system SHALL retry via the same chat completion abstraction without strict JSON mode and continue parsing content-based JSON output.

### Requirement: AI Issue Draft Source Prompt UI
The system SHALL provide an AI issue draft prompt entry surface that opens from the create issue form. The surface SHALL render as a right-side overlay drawer on desktop-sized viewports and as a full-screen sheet or modal on mobile-sized viewports.

#### Scenario: User opens the AI draft prompt surface
- **WHEN** a user clicks the "Generate with AI" action from the create issue form
- **THEN** the system displays a prompt entry surface with a source prompt textarea, output language selector, context hint, cancel action, and generate action.

#### Scenario: Prompt source remains available after generation
- **WHEN** an AI draft has been applied to the create issue form
- **THEN** the form displays a non-intrusive status that an AI draft was applied and provides a way to view the source prompt used for generation.

### Requirement: AI Issue Draft Output Language Selection
The system SHALL allow users to choose the human-readable output language for AI issue drafts. The output language selector SHALL default to the user's currently selected app locale and SHALL include an `Auto` option.

#### Scenario: Draft uses selected locale
- **WHEN** a user selects a supported locale and generates an AI issue draft
- **THEN** generated human-readable fields such as summary, description, assignee reasons, and open questions use the selected locale.

#### Scenario: Auto output language uses prompt language
- **WHEN** a user selects `Auto` and the source prompt has a clear dominant language
- **THEN** generated human-readable fields use the dominant source prompt language.

#### Scenario: Auto output language fallback
- **WHEN** a user selects `Auto` and the source prompt language is mixed, ambiguous, or mostly code/log text
- **THEN** generated human-readable fields use the user's currently selected app locale.

#### Scenario: Machine values are not localized
- **WHEN** the system generates an AI issue draft in any output language
- **THEN** JSON keys, issue type values, priority enum values, IDs, member names, product names, commands, logs, URLs, and exact quoted UI text remain unchanged.

### Requirement: AI Issue Draft Multilingual Prompt Parsing
The system SHALL parse source prompts written in English, Burmese, Khmer, Vietnamese, Korean, Japanese, or mixed-language combinations of those languages.

#### Scenario: Mixed-language chat history is parsed
- **WHEN** a user submits a source prompt containing mixed-language copied chat history
- **THEN** the system extracts issue intent, relevant facts, constraints, and open questions for issue draft generation.

#### Scenario: Ambiguous prompt yields open questions
- **WHEN** a source prompt does not contain enough information to safely infer part of the issue draft
- **THEN** the system includes open questions instead of inventing missing facts.

### Requirement: AI Issue Draft Project Context
The system SHALL use available project context when generating AI issue drafts, including project issue types, team members, active milestones, similar existing issues, relevant project wiki pages, and assignee recommendation evidence.

#### Scenario: Relevant wiki pages inform generation
- **WHEN** a project has indexed wiki pages relevant to the source prompt
- **THEN** the system includes concise project-scoped wiki context during generation without sending the entire wiki.

#### Scenario: Similar issues inform generation
- **WHEN** existing project issues are semantically similar to the source prompt
- **THEN** the system includes concise similar issue context during generation.

#### Scenario: Context retrieval failure does not block generation
- **WHEN** wiki or similar issue context retrieval fails or returns no relevant matches
- **THEN** the system still generates an issue draft from the source prompt and remaining available project context.

### Requirement: AI Issue Draft Assignee Recommendation Evidence
The system SHALL generate assignee suggestions using explicit project-scoped evidence, including member position, current workload, assignment history, similar issue ownership, and relevant wiki authorship or editorship when available. The system MUST NOT treat member skills as first-class recommendation data unless explicit member skills exist in product data.

#### Scenario: Project position informs assignee suggestions
- **WHEN** the system generates assignee suggestions for an AI issue draft
- **THEN** assignee context includes each member's project-scoped `project_members.position` value when available.

#### Scenario: Current workload informs assignee suggestions
- **WHEN** the system generates assignee suggestions for an AI issue draft
- **THEN** assignee context includes current workload signals such as open assigned issues, high-priority open issues, overdue issues, due-soon issues, and open estimated hours when estimates are available.

#### Scenario: Assignment history informs assignee suggestions
- **WHEN** the system generates assignee suggestions for an AI issue draft
- **THEN** assignee context includes relevant assignment history such as recent completed issues, common issue types, and prior ownership of semantically similar issues.

#### Scenario: Similar issue ownership informs assignee suggestions
- **WHEN** semantically similar project issues are found for the source prompt
- **THEN** assignee context includes the assignees of those similar issues when available.

#### Scenario: Wiki contribution is weak evidence
- **WHEN** relevant project wiki pages are retrieved for the source prompt
- **THEN** wiki authorship or editorship MAY be included as weak supporting evidence for assignee suggestions.

#### Scenario: Recommendation reasons cite evidence
- **WHEN** the system returns assignee suggestions
- **THEN** each assignee suggestion reason explains the recommendation using provided project-scoped evidence and does not infer private traits or unstored skills.
