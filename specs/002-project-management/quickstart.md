# Quickstart: Project Management

## Backend

1. **Run Migrations**:
   We added new tables for `projects` and `project_members`.
   ```bash
   cd backend
   php artisan migrate
   ```

2. **Run Backend Server**:
   ```bash
   php artisan serve
   ```
   *Available at http://localhost:8000*

## Frontend

1. **Run Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Available at http://localhost:3000*

## Testing

- **Backend**: `php artisan test`
- **Frontend**: `npm test`