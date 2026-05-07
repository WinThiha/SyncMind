<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\ChatCompletionClient;
use App\Services\AI\Exceptions\ChatCompletionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class OpenRouterChatCompletionClient implements ChatCompletionClient
{
    /**
     * @param array<int, array{role: string, content: string}> $messages
     * @param array<string, mixed> $options
     */
    public function complete(array $messages, array $options = []): string
    {
        $apiKey = (string) config('openai.chat.api_key');
        $baseUri = rtrim((string) config('openai.chat.base_uri'), '/');
        $timeout = (int) config('openai.request_timeout', 30);

        $payload = array_merge([
            'model' => (string) config('openai.chat.model'),
            'messages' => $messages,
        ], $options);

        $response = Http::withToken($apiKey)
            ->withHeaders([
                'HTTP-Referer' => (string) config('app.url'),
                'X-Title' => (string) config('app.name'),
            ])
            ->timeout($timeout)
            ->post("{$baseUri}/chat/completions", $payload)
            ->throw()
            ->json();

        $content = Arr::get($response, 'choices.0.message.content');
        if (! is_string($content) || $content === '') {
            throw new ChatCompletionException('Invalid chat completion response: missing choices[0].message.content.');
        }

        return $content;
    }
}
