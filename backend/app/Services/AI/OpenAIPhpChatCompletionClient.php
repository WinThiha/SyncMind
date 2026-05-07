<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\ChatCompletionClient;
use App\Services\AI\Exceptions\ChatCompletionException;
use OpenAI\Client;

class OpenAIPhpChatCompletionClient implements ChatCompletionClient
{
    public function __construct(private readonly Client $client) {}

    /**
     * @param array<int, array{role: string, content: string}> $messages
     * @param array<string, mixed> $options
     */
    public function complete(array $messages, array $options = []): string
    {
        $payload = array_merge([
            'model' => (string) config('openai.chat.model'),
            'messages' => $messages,
        ], $options);

        $response = $this->client->chat()->create($payload);
        $content = $response->choices[0]->message->content ?? null;

        if (! is_string($content) || $content === '') {
            throw new ChatCompletionException('Invalid chat completion response: missing choices[0].message.content.');
        }

        return $content;
    }
}
