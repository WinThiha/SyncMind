## ADDED Requirements

### Requirement: Dedicated Embedding Provider Configuration
The system MUST provide a dedicated embedding provider configuration that is independent from non-embedding AI model configuration and credentials.

#### Scenario: Embedding settings are configured independently
- **WHEN** the application resolves embedding runtime configuration
- **THEN** it MUST read embedding provider settings (including base URI, API key, and model) from embedding-specific configuration keys rather than non-embedding AI keys

#### Scenario: Embedding key rotation does not affect non-embedding services
- **WHEN** operators rotate embedding provider credentials
- **THEN** issue suggestion and thread summarization services MUST continue using their own configured credentials without modification

### Requirement: Backward-Compatible Embedding Config Migration
The system MUST support a deterministic fallback mapping from legacy AI environment keys to the new embedding-specific keys during migration.

#### Scenario: New keys are present
- **WHEN** embedding-specific environment keys are configured
- **THEN** the system MUST prioritize and use those keys over legacy AI keys

#### Scenario: New keys are absent
- **WHEN** embedding-specific environment keys are not configured
- **THEN** the system MUST fall back to documented legacy AI key mappings so existing deployments remain functional during migration
