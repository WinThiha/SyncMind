<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use App\Models\WikiPage;
use App\Services\AI\Contracts\ChatCompletionClient;
use App\Support\LocaleResolver;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIIssueSuggestionService
{
    public function __construct(
        private readonly ChatCompletionClient $chatClient,
        private readonly LocaleResolver $localeResolver
    ) {}

    /**
     * Suggest issue fields based on a source prompt and project context.
     *
     * Returns an array with keys: summary, description, issue_type, priority, estimated_hours,
     * due_date, milestone_id, assignee_suggestions, open_questions.
     * Each field is null if the AI could not produce a valid value.
     * assignee_suggestions is an array of {assignee_id, reason} objects, capped at 3 entries.
     */
    public function suggest(
        Project $project,
        string $prompt,
        ?User $actor = null,
        ?string $outputLocale = null,
        array $currentFields = []
    ): array
    {
        $issueTypes = $project->issue_types ?? ['Task', 'Bug', 'Request'];
        $priorities = ['low', 'normal', 'high'];
        $userLocale = $this->localeResolver->resolveForUser($actor);
        $locale = $this->resolveOutputLocale($outputLocale, $userLocale);
        $languageLabel = $locale === 'auto'
            ? "Auto-detect the dominant source prompt language; if unclear, use {$this->localeResolver->humanLabel($userLocale)} ({$userLocale})"
            : "{$this->localeResolver->humanLabel($locale)} ({$locale})";

        $similarIssues = $this->safeSimilarIssues($project, $prompt);
        $wikiContext = $this->safeWikiContext($project, $prompt);
        $milestones = $this->milestoneContext($project);
        $members = $this->assigneeContext($project, $similarIssues, $wikiContext);

        $currentFieldsJson = json_encode($this->normalizeCurrentFields($currentFields), JSON_UNESCAPED_UNICODE);
        $membersJson = json_encode($members, JSON_UNESCAPED_UNICODE);
        $milestonesJson = json_encode($milestones, JSON_UNESCAPED_UNICODE);
        $similarIssuesJson = json_encode($similarIssues, JSON_UNESCAPED_UNICODE);
        $wikiContextJson = json_encode($wikiContext, JSON_UNESCAPED_UNICODE);
        $typesJson = json_encode($issueTypes, JSON_UNESCAPED_UNICODE);
        $prioritiesJson = json_encode($priorities);

        $systemPrompt = <<<PROMPT
You are an expert project management assistant. Analyze the source prompt and suggest appropriate values for a new issue draft.
Output language: {$languageLabel}.

The source prompt may be a short natural-language brief, bug report, copied chat history, support note, meeting excerpt, or mixed-language text. It may contain English, Burmese, Khmer, Vietnamese, Korean, Japanese, or combinations of those languages.

Available issue types: {$typesJson}
Available priorities: {$prioritiesJson}
Team members: {$membersJson}
Active milestones: {$milestonesJson}
Similar project issues: {$similarIssuesJson}
Relevant project wiki excerpts: {$wikiContextJson}
Current form fields: {$currentFieldsJson}

Rules:
- summary should be a concise issue title derived from the source prompt.
- issue_type MUST be one of the available issue types exactly as listed.
- issue_type is user-defined project data and MUST NOT be translated, normalized, or paraphrased.
- priority MUST be one of: "low", "normal", "high".
- assignee_suggestions is an array of up to 3 objects, each with assignee_id (integer, must be one of the team member IDs from the team members list) and reason (string, non-empty explanation for why this person is a good fit for this issue).
- Balance assignee relevance against workload. Prefer relevant project position, assignment history, similar issue ownership, and weak wiki contribution evidence, but do not exclude overloaded members when their evidence is clearly strongest.
- Assignee reasons MUST cite provided evidence and MUST NOT claim private traits or unstored skills.
- estimated_hours should be a reasonable estimate in hours (a positive number, e.g. 2, 4, 8), or null if unclear.
- due_date should be an ISO date string (YYYY-MM-DD) when the source prompt or milestone context clearly supports it, or null.
- milestone_id should be one of the active milestone IDs when clearly appropriate, or null.
- description should be a concise markdown description expanding on the summary with context, steps, and acceptance criteria where applicable.
- open_questions should list concise questions when important facts are ambiguous instead of inventing missing details.
- Localize all human-readable generated values (summary, description, assignee_suggestions.reason, open_questions) to the selected output language.
- Preserve exact product names, member names, commands, logs, URLs, IDs, and quoted UI text from the source prompt.
- Keep JSON keys and machine-constrained values in this schema unchanged.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "summary": "<string>",
  "description": "<string>",
  "issue_type": "<string>",
  "priority": "<string>",
  "estimated_hours": <number or null>,
  "due_date": "<YYYY-MM-DD or null>",
  "milestone_id": <integer or null>,
  "assignee_suggestions": [{"assignee_id": <integer>, "reason": "<string>"}, ...],
  "open_questions": ["<string>", ...]
}
PROMPT;

        $model = config('openai.chat.model', config('openai.model', 'gpt-4o-mini'));
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => "Source prompt:\n{$prompt}"],
        ];

        // Try with structured JSON mode first; fall back for models that don't support it.
        try {
            $raw = $this->chatClient->complete($messages, [
                'model' => (string) $model,
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.3,
            ]);
        } catch (\Throwable $e) {
            $raw = $this->chatClient->complete($messages, [
                'model' => (string) $model,
                'temperature' => 0.3,
            ]);
        }
        $data = $this->parseJson($raw);

        return $this->sanitize($data, $issueTypes, $members, $milestones);
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

    private function sanitize(array $data, array $issueTypes, array $members, array $milestones): array
    {
        $validMemberIds = array_column($members, 'id');
        $validMilestoneIds = array_column($milestones, 'id');

        $summary = is_string($data['summary'] ?? null) && trim($data['summary']) !== ''
            ? trim($data['summary'])
            : null;

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

        $due_date = null;
        if (is_string($data['due_date'] ?? null) && $data['due_date'] !== '') {
            try {
                $due_date = Carbon::parse($data['due_date'])->toDateString();
            } catch (\Throwable) {
                $due_date = null;
            }
        }

        $milestone_id = in_array($data['milestone_id'] ?? null, $validMilestoneIds, true)
            ? (int) $data['milestone_id']
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

        $open_questions = [];
        if (is_array($data['open_questions'] ?? null)) {
            foreach ($data['open_questions'] as $question) {
                if (is_string($question) && trim($question) !== '') {
                    $open_questions[] = trim($question);
                }
            }
        }

        return compact(
            'summary',
            'description',
            'issue_type',
            'priority',
            'estimated_hours',
            'due_date',
            'milestone_id',
            'assignee_suggestions',
            'open_questions'
        );
    }

    private function resolveOutputLocale(?string $outputLocale, string $userLocale): string
    {
        if ($outputLocale === 'auto') {
            return 'auto';
        }

        if (is_string($outputLocale) && in_array($outputLocale, LocaleResolver::SUPPORTED_LOCALES, true)) {
            return $outputLocale;
        }

        return $userLocale;
    }

    private function normalizeCurrentFields(array $currentFields): array
    {
        return Arr::only($currentFields, [
            'summary',
            'description',
            'issue_type',
            'priority',
            'estimated_hours',
            'assignee_id',
            'due_date',
            'milestone_id',
        ]);
    }

    private function milestoneContext(Project $project): array
    {
        return $project->milestones()
            ->where('status', '!=', 'closed')
            ->get(['id', 'name', 'description', 'status', 'start_date', 'due_date'])
            ->map(fn ($milestone) => [
                'id' => $milestone->id,
                'name' => $milestone->name,
                'description' => mb_substr((string) $milestone->description, 0, 300),
                'status' => $milestone->status,
                'start_date' => optional($milestone->start_date)->toDateString(),
                'due_date' => optional($milestone->due_date)->toDateString(),
            ])
            ->values()
            ->all();
    }

    private function assigneeContext(Project $project, array $similarIssues, array $wikiContext): array
    {
        $memberIds = $project->members()->pluck('users.id')->all();
        $similarAssigneeCounts = collect($similarIssues)
            ->pluck('assignee_id')
            ->filter()
            ->countBy();
        $wikiContributionCounts = collect($wikiContext)
            ->flatMap(fn ($page) => [$page['author_id'] ?? null, $page['last_editor_id'] ?? null])
            ->filter()
            ->countBy();

        return $project->members()
            ->select('users.id', 'users.name')
            ->get()
            ->map(function ($member) use ($project, $memberIds, $similarAssigneeCounts, $wikiContributionCounts) {
                $openIssues = Issue::query()
                    ->where('project_id', $project->id)
                    ->where('assignee_id', $member->id)
                    ->whereNotIn('status', ['resolved', 'closed']);

                $recentCompleted = Issue::query()
                    ->where('project_id', $project->id)
                    ->where('assignee_id', $member->id)
                    ->whereIn('status', ['resolved', 'closed'])
                    ->latest('updated_at')
                    ->limit(5)
                    ->get(['summary', 'issue_type', 'updated_at'])
                    ->map(fn ($issue) => [
                        'summary' => $issue->summary,
                        'issue_type' => $issue->issue_type,
                        'completed_at' => optional($issue->updated_at)->toDateString(),
                    ])
                    ->values()
                    ->all();

                $commonIssueTypes = Issue::query()
                    ->where('project_id', $project->id)
                    ->where('assignee_id', $member->id)
                    ->whereIn('assignee_id', $memberIds)
                    ->selectRaw('issue_type, count(*) as aggregate')
                    ->groupBy('issue_type')
                    ->orderByDesc('aggregate')
                    ->limit(3)
                    ->pluck('issue_type')
                    ->all();

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'position' => $member->pivot?->position ?? 'Team Member',
                    'workload' => [
                        'open_issues' => (clone $openIssues)->count(),
                        'high_priority_open' => (clone $openIssues)->where('priority', 'high')->count(),
                        'overdue' => (clone $openIssues)->whereNotNull('due_date')->whereDate('due_date', '<', now()->toDateString())->count(),
                        'due_soon' => (clone $openIssues)->whereBetween('due_date', [now()->toDateString(), now()->addDays(7)->toDateString()])->count(),
                        'open_estimated_hours' => (float) ((clone $openIssues)->sum('estimated_hours') ?? 0),
                    ],
                    'history' => [
                        'recent_completed' => $recentCompleted,
                        'common_issue_types' => $commonIssueTypes,
                        'similar_issues_assigned' => (int) ($similarAssigneeCounts[$member->id] ?? 0),
                    ],
                    'wiki_contribution_matches' => (int) ($wikiContributionCounts[$member->id] ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    private function safeSimilarIssues(Project $project, string $prompt): array
    {
        try {
            return app(AIIssueSearchService::class)
                ->findSimilar($project, $prompt, 5)
                ->map(fn ($issue) => [
                    'id' => $issue->id,
                    'key' => $issue->key,
                    'summary' => $issue->summary,
                    'status' => $issue->status,
                    'priority' => $issue->priority,
                    'issue_type' => $issue->issue_type,
                    'assignee_id' => $issue->assignee_id,
                    'assignee_name' => $issue->assignee?->name,
                    'similarity' => $issue->similarity,
                ])
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::info('AI issue suggestion similar issue context unavailable', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function safeWikiContext(Project $project, string $prompt): array
    {
        try {
            $embedding = $this->embed($prompt);
            $vectorString = '['.implode(',', $embedding).']';

            return WikiPage::query()
                ->where('project_id', $project->id)
                ->whereNotNull('embedding')
                ->select(['id', 'title', 'content', 'author_id', 'last_editor_id'])
                ->selectRaw('embedding <=> ? AS distance', [$vectorString])
                ->orderBy('distance')
                ->limit(3)
                ->get()
                ->map(fn ($page) => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'excerpt' => mb_substr((string) $page->content, 0, 1000),
                    'author_id' => $page->author_id,
                    'last_editor_id' => $page->last_editor_id,
                    'similarity' => round(1 - $page->distance, 4),
                ])
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::info('AI issue suggestion wiki context unavailable', ['error' => $e->getMessage()]);

            return [];
        }
    }

    private function embed(string $text): array
    {
        $baseUrl = rtrim((string) config('openai.embedding.base_uri'), '/');
        $model = (string) config('openai.embedding.model');
        $apiKey = (string) config('openai.embedding.api_key');
        $dimensions = config('openai.embedding.dimensions');

        $payload = ['model' => $model, 'input' => $text];
        if (is_numeric($dimensions) && (int) $dimensions > 0) {
            $payload['dimensions'] = (int) $dimensions;
        }

        $embedding = Arr::get(Http::withToken($apiKey)
            ->post("{$baseUrl}/embeddings", $payload)
            ->throw()
            ->json(), 'data.0.embedding');

        if (! is_array($embedding) || $embedding === []) {
            throw new \RuntimeException('Embedding response did not contain data.0.embedding.');
        }

        return $embedding;
    }
}
