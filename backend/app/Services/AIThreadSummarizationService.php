<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\User;
use App\Services\AI\Contracts\ChatCompletionClient;
use App\Support\LocaleResolver;

class AIThreadSummarizationService
{
    public function __construct(
        private readonly ChatCompletionClient $chatClient,
        private readonly LocaleResolver $localeResolver
    ) {}

    /**
     * Aggregate comments and history into a single chronological timeline.
     */
    public function aggregateTimeline(Issue $issue): array
    {
        $comments = $issue->comments()->with('user')->get();
        $history = $issue->history()->with('user')->get();

        $events = collect();

        foreach ($comments as $comment) {
            $events->push([
                'type' => 'comment',
                'user' => $comment->user->name,
                'content' => $comment->content,
                'created_at' => $comment->created_at,
            ]);
        }

        foreach ($history as $entry) {
            $events->push([
                'type' => 'history',
                'user' => $entry->user->name ?? 'System',
                'field' => $entry->field,
                'old_value' => $entry->old_value,
                'new_value' => $entry->new_value,
                'created_at' => $entry->created_at,
            ]);
        }

        return $events->sortBy('created_at')->values()->all();
    }

    /**
     * Generate an AI summary of the issue timeline.
     */
    public function summarize(Issue $issue, ?User $actor = null): array
    {
        $events = $this->aggregateTimeline($issue);
        $locale = $this->localeResolver->resolveForUser($actor);
        $languageLabel = $this->localeResolver->humanLabel($locale);

        if (empty($events)) {
            return [
                'summary' => 'No activity recorded for this issue yet.',
                'decisions' => [],
                'consensus' => 'N/A',
                'action_items' => [],
            ];
        }

        // Limit to last 50 events for context efficiency
        $events = array_slice($events, -50);

        $timelineText = '';
        foreach ($events as $event) {
            $time = $event['created_at']->format('Y-m-d H:i');
            if ($event['type'] === 'comment') {
                $timelineText .= "[{$time}] {$event['user']}: Commented: \"{$event['content']}\"\n";
            } else {
                $timelineText .= "[{$time}] {$event['user']}: Changed {$event['field']} from '{$event['old_value']}' to '{$event['new_value']}'\n";
            }
        }

        $systemPrompt = <<<'PROMPT'
You are an expert project management assistant. Analyze the following timeline of an issue (including comments and field changes) and provide a structured summary.
PROMPT;

        $localePrompt = <<<PROMPT
Output language locale: {$locale} ({$languageLabel}).

Focus on:
1. **Summary**: A high-level overview of the thread's progress.
2. **Decisions**: Any final decisions made by the team.
3. **Consensus**: The current state of agreement or ongoing debate.
4. **Action Items**: Tasks assigned or agreed upon for the future.

Rules:
- Distinguish between proposed ideas and final decisions.
- Be concise and professional.
- Use Markdown for the content where appropriate.
- Localize human-readable values to the output language locale.
- Keep JSON keys exactly as: summary, decisions, consensus, action_items.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "summary": "<string>",
  "decisions": ["<string>", ...],
  "consensus": "<string>",
  "action_items": ["<string>", ...]
}
PROMPT;
        $systemPrompt .= "\n\n".$localePrompt;

        $model = config('openai.chat.model', config('openai.model', 'gpt-4o-mini'));
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user',   'content' => "Issue Summary: {$issue->summary}\n\nTimeline:\n{$timelineText}"],
        ];

        try {
            $raw = $this->chatClient->complete($messages, [
                'model' => (string) $model,
                'response_format' => ['type' => 'json_object'],
                'temperature' => 0.3,
            ]);
        } catch (\Throwable $e) {
            // Fallback for models without json_object support
            $raw = $this->chatClient->complete($messages, [
                'model' => (string) $model,
                'temperature' => 0.3,
            ]);
        }

        return $this->parseJson($raw);
    }

    /**
     * Extract a JSON object from the model response.
     */
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

        return [
            'summary' => 'Failed to parse AI response.',
            'decisions' => [],
            'consensus' => 'Unknown',
            'action_items' => [],
        ];
    }
}
