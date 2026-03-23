# Quickstart: Issue Management

## Backend Setup

1. **Migrations**:
   Run the migrations to create the new issue tracking tables.
   ```bash
   docker compose exec backend php artisan migrate
   ```

2. **Seeders (Optional)**:
   You can generate test issues using the factory.
   ```bash
   docker compose exec backend php artisan tinker
   >>> \App\Models\Issue::factory()->count(10)->create(['project_id' => 1]);
   ```

## Frontend Setup

1. **Components**:
   The issue list and detail views are located in `frontend/src/components/issues/`.

2. **Routes**:
   Access the issues for a project at `http://localhost:3000/projects/{id}/issues`.

## Implementation Notes

- **Issue Keys**: Generated automatically on creation. Format is `{ProjectKey}-{Number}`.
- **Change History**: Logged automatically via the `IssueObserver`. No manual logging needed in controllers.
- **Markdown**: Handled by the `MarkdownRenderer` component on the frontend.
