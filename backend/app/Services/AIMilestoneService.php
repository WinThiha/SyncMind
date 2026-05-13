<?php

namespace App\Services;

use App\Models\Milestone;
use App\Models\Project;
use App\Models\User;
use App\Services\AI\Contracts\ChatCompletionClient;

class AIMilestoneService
{
    public function __construct(
        private readonly ChatCompletionClient $chatClient,
        private readonly AIIssueSearchService $searchService
    ) {}

    public function summarize(Milestone $milestone, ?User $actor = null): array
    {
        $issueList = $this->formatIssueList($milestone, 20);
        $progress = $milestone->progress;

        $systemPrompt = <<<'PROMPT'
You are an expert project management assistant. Analyze the given milestone and provide a concise natural-language summary of its progress, health, and any notable risks or highlights.

Rules:
- Be concise and professional (2–4 sentences).
- Mention completion percentage, overdue status, and any notable open/blocked items.
- Respond ONLY with a valid JSON object matching this exact schema:
{"summary": "<string>"}
PROMPT;

        $userContent = $this->buildMilestoneContext($milestone, $issueList, $progress);

        $raw = $this->callChat($systemPrompt, $userContent);
        $data = $this->parseJson($raw);

        return [
            'summary' => is_string($data['summary'] ?? null) ? $data['summary'] : 'Unable to generate summary.',
            'generated_at' => now()->toISOString(),
        ];
    }

    public function analyzeRisk(Milestone $milestone, ?User $actor = null): array
    {
        $issues = $milestone->issues()->with('assignee')->get();
        $overdueCount = $issues->filter(fn ($i) => $i->due_date && $i->due_date < now()->toDateString() && ! in_array($i->status, ['resolved', 'closed']))->count();
        $highPriorityOpenCount = $issues->filter(fn ($i) => $i->priority === 'high' && ! in_array($i->status, ['resolved', 'closed']))->count();
        $progress = $milestone->progress;

        $systemPrompt = <<<'PROMPT'
You are an expert project management assistant. Analyze the given milestone data and produce a structured risk assessment.

Verdict rules:
- "on_track": completion is on schedule, no critical overdue issues.
- "at_risk": some overdue issues or high-priority open items that may threaten the deadline.
- "critical": milestone is overdue or has a high proportion of unresolved high-priority issues.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "verdict": "on_track|at_risk|critical",
  "signals": ["<string>", ...],
  "recommendation": "<string>"
}
PROMPT;

        $dueDate = $milestone->due_date?->toDateString() ?? 'none';
        $startDate = $milestone->start_date?->toDateString() ?? 'none';
        $today = now()->toDateString();
        $isOverdue = $milestone->is_overdue ? 'yes' : 'no';

        $userContent = <<<TEXT
Milestone: {$milestone->name}
Status: {$milestone->status}
Start: {$startDate} | Due: {$dueDate} | Today: {$today} | Overdue: {$isOverdue}
Progress: {$progress['completed']}/{$progress['total']} issues complete ({$progress['percentage']}%)
Overdue issues: {$overdueCount}
High-priority open issues: {$highPriorityOpenCount}
TEXT;

        $raw = $this->callChat($systemPrompt, $userContent);
        $data = $this->parseJson($raw);

        $validVerdicts = ['on_track', 'at_risk', 'critical'];

        return [
            'verdict' => in_array($data['verdict'] ?? null, $validVerdicts) ? $data['verdict'] : 'at_risk',
            'signals' => is_array($data['signals'] ?? null) ? array_values(array_filter($data['signals'], 'is_string')) : [],
            'recommendation' => is_string($data['recommendation'] ?? null) ? $data['recommendation'] : '',
            'generated_at' => now()->toISOString(),
        ];
    }

    public function suggestDates(Milestone $milestone, string $context = ''): array
    {
        return $this->suggestDatesForProject(
            $milestone->project,
            $milestone->name,
            $milestone->description ?? '',
            $context
        );
    }

    public function suggestDatesForProject(Project $project, string $name, string $description = '', string $context = ''): array
    {
        $issues = $project->issues()
            ->whereNotIn('status', ['resolved', 'closed'])
            ->select(['summary', 'priority', 'status', 'due_date', 'estimated_hours'])
            ->limit(30)
            ->get();

        $today = now()->toDateString();
        $issueLines = $issues->map(function ($i) {
            $due = $i->due_date ?? 'none';
            $est = $i->estimated_hours ?? '?';

            return "- [{$i->priority}] {$i->summary} | status: {$i->status} | due: {$due} | estimate: {$est}h";
        })->implode("\n");

        $systemPrompt = <<<'PROMPT'
You are an expert project manager. Suggest realistic start and due dates for the described milestone based on the open issues in the project.

Rules:
- Dates must be in YYYY-MM-DD format or null.
- Provide a brief rationale explaining your reasoning.
- Respond ONLY with a valid JSON object matching this exact schema:
{"start_date": "<YYYY-MM-DD or null>", "due_date": "<YYYY-MM-DD or null>", "rationale": "<string>"}
PROMPT;

        $userContent = "Today: {$today}\nMilestone name: {$name}\nDescription: {$description}\nExtra context: {$context}\n\nOpen issues in project:\n{$issueLines}";

        $raw = $this->callChat($systemPrompt, $userContent);
        $data = $this->parseJson($raw);

        $startDate = $this->sanitizeDate($data['start_date'] ?? null);
        $dueDate = $this->sanitizeDate($data['due_date'] ?? null);

        return [
            'start_date' => $startDate,
            'due_date' => $dueDate,
            'rationale' => is_string($data['rationale'] ?? null) ? $data['rationale'] : '',
        ];
    }

    public function suggestIssues(Milestone $milestone, int $limit = 10): array
    {
        $query = trim("{$milestone->name}. {$milestone->description}");
        if ($query === '.') {
            return [];
        }

        $linkedIds = $milestone->issues()->pluck('id')->toArray();
        $searchLimit = min($limit + count($linkedIds) + 5, 50);

        $similar = $this->searchService->findSimilar($milestone->project, $query, $searchLimit);

        $candidates = $similar
            ->filter(fn ($issue) => ! in_array($issue->id, $linkedIds))
            ->take($limit)
            ->values();

        if ($candidates->isEmpty()) {
            return [];
        }

        $reasons = $this->generateReasons($milestone->name, $candidates->toArray());

        return $candidates->map(function ($issue, $index) use ($reasons) {
            return [
                'issue_id' => $issue->id,
                'key' => $issue->key ?? "#{$issue->key_number}",
                'summary' => $issue->summary,
                'score' => $issue->similarity ?? 0,
                'reason' => $reasons[$index] ?? 'Semantically related to this milestone.',
            ];
        })->values()->all();
    }

    private function generateReasons(string $milestoneName, array $issues): array
    {
        if (empty($issues)) {
            return [];
        }

        $issueList = collect($issues)->map(fn ($i, $idx) => ($idx + 1).". [{$i['key']}] {$i['summary']}"
        )->implode("\n");

        $systemPrompt = <<<'PROMPT'
You are a project management assistant. For each issue below, write a single short sentence (max 15 words) explaining why it is relevant to the given milestone.

Respond ONLY with a valid JSON array of strings in the same order as the issues:
["<reason for issue 1>", "<reason for issue 2>", ...]
PROMPT;

        $userContent = "Milestone: {$milestoneName}\n\nIssues:\n{$issueList}";

        $raw = $this->callChat($systemPrompt, $userContent);

        $stripped = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $stripped = preg_replace('/\s*```$/', '', $stripped ?? $raw);
        $decoded = json_decode($stripped, true);

        if (is_array($decoded)) {
            return array_values(array_map(fn ($r) => is_string($r) ? $r : '', $decoded));
        }

        return array_fill(0, count($issues), 'Relevant to this milestone scope.');
    }

    private function callChat(string $systemPrompt, string $userContent): string
    {
        $model = config('openai.chat.model', config('openai.model', 'gpt-4o-mini'));
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => $userContent],
        ];

        try {
            return $this->chatClient->complete($messages, [
                'model' => (string) $model,
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.3,
            ]);
        } catch (\Throwable) {
            return $this->chatClient->complete($messages, [
                'model' => (string) $model,
                'temperature' => 0.3,
            ]);
        }
    }

    private function parseJson(string $raw): array
    {
        $stripped = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $stripped = preg_replace('/\s*```$/', '', $stripped ?? $raw);

        $decoded = json_decode($stripped, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        if (preg_match('/\{.*\}/s', $raw, $matches)) {
            $decoded = json_decode($matches[0], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }

    private function formatIssueList(Milestone $milestone, int $limit): string
    {
        return $milestone->issues()
            ->select(['summary', 'status', 'priority', 'due_date'])
            ->limit($limit)
            ->get()
            ->map(fn ($i) => "- [{$i->priority}] {$i->summary} | {$i->status}".($i->due_date ? " | due: {$i->due_date}" : ''))
            ->implode("\n");
    }

    private function buildMilestoneContext(Milestone $milestone, string $issueList, array $progress): string
    {
        $dueDate = $milestone->due_date?->toDateString() ?? 'none';
        $startDate = $milestone->start_date?->toDateString() ?? 'none';
        $isOverdue = $milestone->is_overdue ? 'yes' : 'no';

        return <<<TEXT
Milestone: {$milestone->name}
Description: {$milestone->description}
Status: {$milestone->status}
Start: {$startDate} | Due: {$dueDate} | Overdue: {$isOverdue}
Progress: {$progress['completed']}/{$progress['total']} issues complete ({$progress['percentage']}%)

Issues:
{$issueList}
TEXT;
    }

    private function sanitizeDate(?string $value): ?string
    {
        if (! is_string($value) || $value === '' || $value === 'null') {
            return null;
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value;
        }

        return null;
    }
}
