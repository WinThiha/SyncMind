<?php

namespace App\Services;

use App\Models\Project;
use OpenAI\Client;

class AIIssueSuggestionService
{
    private Client $client;

    public function __construct()
    {
        $this->client = app('ai.client');
    }

    /**
     * Suggest issue fields based on a summary and project context.
     *
     * Returns an array with keys: description, issue_type, priority, estimated_hours, assignee_suggestions
     * Each field is null if the AI could not produce a valid value.
     * assignee_suggestions is an array of {assignee_id, reason} objects, capped at 3 entries.
     */
    public function suggest(Project $project, string $summary): array
    {
        \Log::info('test');
        $issueTypes = $project->issue_types ?? ['Task', 'Bug', 'Request'];
        $priorities = ['low', 'normal', 'high'];

        $members = $project->members()
            ->select('users.id', 'users.name', 'users.position')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'position' => $m->position ?? 'Team Member',
            ])
            ->values()
            ->all();

        $membersJson = json_encode($members, JSON_UNESCAPED_UNICODE);
        $typesJson = json_encode($issueTypes, JSON_UNESCAPED_UNICODE);
        $prioritiesJson = json_encode($priorities);

        $systemPrompt = <<<PROMPT
You are an expert project management assistant. Analyze the given issue summary and suggest appropriate values for the issue fields.

Available issue types: {$typesJson}
Available priorities: {$prioritiesJson}
Team members: {$membersJson}

Rules:
- issue_type MUST be one of the available issue types exactly as listed.
- priority MUST be one of: "low", "normal", "high".
- assignee_suggestions is an array of up to 3 objects, each with assignee_id (integer, must be one of the team member IDs from the team members list) and reason (string, non-empty explanation for why this person is a good fit for this issue).
- estimated_hours should be a reasonable estimate in hours (a positive number, e.g. 2, 4, 8), or null if unclear.
- description should be a concise markdown description expanding on the summary with context, steps, and acceptance criteria where applicable.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "description": "<string>",
  "issue_type": "<string>",
  "priority": "<string>",
  "estimated_hours": <number or null>,
  "assignee_suggestions": [{"assignee_id": <integer>, "reason": "<string>"}, ...]
}
PROMPT;

        $model = config('openai.model', 'gpt-4o-mini');
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => "Issue summary: {$summary}"],
        ];

        // Try with structured JSON mode first; fall back for models that don't support it.
        try {
            $response = $this->client->chat()->create([
                'model' => $model,
                'messages' => $messages,
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.3,
            ]);
        } catch (\Throwable $e) {
            \Log::debug($e->getMessage());
            $response = $this->client->chat()->create([
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.3,
            ]);
        }
        \Log::debug(collect($response)->toArray());

        $raw = $response->choices[0]->message->content ?? '{}';
        $data = $this->parseJson($raw);

        return $this->sanitize($data, $issueTypes, $members);
    }

    /**
     * Extract a JSON object from the model response, handling markdown code fences
     * and other common wrapping that models use when not in strict JSON mode.
     */
    private function parseJson(string $raw): array
    {
        // Strip markdown code fences (```json ... ``` or ``` ... ```)
        $stripped = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $stripped = preg_replace('/\s*```$/', '', $stripped ?? $raw);

        $decoded = json_decode($stripped, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        // Last resort: find the first {...} block in the raw text
        if (preg_match('/\{.*\}/s', $raw, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }

    private function sanitize(array $data, array $issueTypes, array $members): array
    {
        $validMemberIds = array_column($members, 'id');

        $issue_type = in_array($data['issue_type'] ?? null, $issueTypes)
            ? $data['issue_type']
            : null;

        $priority = in_array($data['priority'] ?? null, ['low', 'normal', 'high'])
            ? $data['priority']
            : null;

        $estimated_hours = is_numeric($data['estimated_hours'] ?? null) && $data['estimated_hours'] > 0
            ? (float) $data['estimated_hours']
            : null;

        $description = is_string($data['description'] ?? null) && $data['description'] !== ''
            ? $data['description']
            : null;

        $assignee_suggestions = [];
        if (is_array($data['assignee_suggestions'] ?? null)) {
            foreach ($data['assignee_suggestions'] as $suggestion) {
                if (count($assignee_suggestions) >= 3) {
                    break;
                }
                $assigneeId = $suggestion['assignee_id'] ?? null;
                $reason = $suggestion['reason'] ?? null;
                if (in_array($assigneeId, $validMemberIds) && is_string($reason) && $reason !== '') {
                    $assignee_suggestions[] = [
                        'assignee_id' => (int) $assigneeId,
                        'reason' => $reason,
                    ];
                }
            }
        }

        return compact('description', 'issue_type', 'priority', 'estimated_hours', 'assignee_suggestions');
    }
}
