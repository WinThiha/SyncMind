<?php

namespace App\Services;

use App\Models\Project;
use App\Models\WikiPage;
use App\Services\AI\Contracts\ChatCompletionClient;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AIWikiService
{
    public function __construct(
        private readonly ChatCompletionClient $chatClient
    ) {}

    private function resolveLanguage(string $locale): string
    {
        return match ($locale) {
            'ja-JP' => 'Japanese',
            'my-MM' => 'Burmese (Myanmar)',
            'km-KH' => 'Khmer (Cambodian)',
            'vi-VN' => 'Vietnamese',
            'ko-KR' => 'Korean',
            default => 'English',
        };
    }

    public function chat(Project $project, string $message, array $history = [], string $locale = 'en'): string
    {
        $embedding = $this->embed($message);
        $vectorString = '['.implode(',', $embedding).']';

        $pages = WikiPage::query()
            ->where('project_id', $project->id)
            ->whereNotNull('embedding')
            ->select(['id', 'title', 'content'])
            ->selectRaw('embedding <=> ? AS distance', [$vectorString])
            ->orderBy('distance', 'asc')
            ->limit(3)
            ->get();

        $contextText = '';
        foreach ($pages as $page) {
            $content = mb_substr((string) $page->content, 0, 2000);
            $contextText .= "## {$page->title}\n{$content}\n\n";
        }

        $noPagesFallback = $contextText === ''
            ? "\nNo wiki pages have been indexed yet. Let the user know the wiki may still be empty or embeddings are being generated.\n"
            : $contextText;

        $language = $this->resolveLanguage($locale);

        $systemPrompt = <<<PROMPT
You are a helpful project assistant for the "{$project->name}" project. Answer questions using ONLY the wiki pages provided below. If the answer is not in the provided pages, say so clearly. Always cite the page title(s) you used in your answer. Respond in {$language}.

Wiki pages:
{$noPagesFallback}
PROMPT;

        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        // Include last 10 conversation turns (20 messages) from client history
        $trimmedHistory = array_slice($history, -20);
        foreach ($trimmedHistory as $turn) {
            if (in_array($turn['role'] ?? '', ['user', 'assistant'], true)) {
                $messages[] = ['role' => $turn['role'], 'content' => (string) $turn['content']];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        $model = config('openai.chat.model', config('openai.model', 'gpt-4o-mini'));

        return $this->chatClient->complete($messages, [
            'model' => (string) $model,
            'temperature' => 0.4,
        ]);
    }

    public function draft(Project $project, string $prompt, string $locale = 'en'): string
    {
        $wikiContext = WikiPage::where('project_id', $project->id)
            ->get(['title', 'content'])
            ->map(fn ($p) => "## {$p->title}\n".mb_substr((string) $p->content, 0, 500))
            ->implode("\n\n");

        $issues = $project->issues()
            ->latest()
            ->limit(20)
            ->get(['summary', 'status'])
            ->map(fn ($i) => "- [{$i->status}] {$i->summary}")
            ->implode("\n");

        $milestones = $project->milestones()
            ->get(['name', 'status'])
            ->map(fn ($m) => "- {$m->name} ({$m->status})")
            ->implode("\n");

        $language = $this->resolveLanguage($locale);

        $systemPrompt = <<<PROMPT
You are a technical writer for a software development team working on the "{$project->name}" project. Draft a clear, well-structured markdown wiki page based on the request below.

Use proper markdown formatting with headings, bullet points, and code blocks where appropriate. Return only the markdown content — no preamble, no explanation. Write the entire page in {$language}.

Project context:

### Existing wiki pages:
{$wikiContext}

### Recent issues:
{$issues}

### Milestones:
{$milestones}
PROMPT;

        $model = config('openai.chat.model', config('openai.model', 'gpt-4o-mini'));

        return $this->chatClient->complete(
            [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $prompt],
            ],
            [
                'model' => (string) $model,
                'temperature' => 0.6,
            ]
        );
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

        $response = Http::withToken($apiKey)
            ->post("{$baseUrl}/embeddings", $payload)
            ->throw()
            ->json();

        $embedding = Arr::get($response, 'data.0.embedding');
        if (! is_array($embedding) || $embedding === []) {
            throw new RuntimeException('Embedding response did not contain data.0.embedding.');
        }

        return $embedding;
    }
}
