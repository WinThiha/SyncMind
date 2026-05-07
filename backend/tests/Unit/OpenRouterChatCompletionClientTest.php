<?php

namespace Tests\Unit;

use App\Services\AI\Exceptions\ChatCompletionException;
use App\Services\AI\OpenRouterChatCompletionClient;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OpenRouterChatCompletionClientTest extends TestCase
{
    public function test_it_sends_openrouter_request_and_returns_content(): void
    {
        config()->set('openai.chat.api_key', 'chat-key');
        config()->set('openai.chat.base_uri', 'https://openrouter.ai/api/v1');
        config()->set('openai.chat.model', 'openrouter/model');
        config()->set('app.url', 'https://syncmind.local');
        config()->set('app.name', 'SyncMind');

        Http::fake([
            'https://openrouter.ai/api/v1/chat/completions' => Http::response([
                'choices' => [
                    ['message' => ['content' => '{"ok":true}']],
                ],
            ]),
        ]);

        $client = new OpenRouterChatCompletionClient();
        $content = $client->complete([
            ['role' => 'user', 'content' => 'hello'],
        ], ['temperature' => 0.3]);

        $this->assertSame('{"ok":true}', $content);

        Http::assertSent(function ($request) {
            $headers = $request->headers();

            return $request->url() === 'https://openrouter.ai/api/v1/chat/completions'
                && ($headers['Authorization'][0] ?? null) === 'Bearer chat-key'
                && ($headers['HTTP-Referer'][0] ?? null) === 'https://syncmind.local'
                && ($headers['X-Title'][0] ?? null) === 'SyncMind'
                && $request['model'] === 'openrouter/model'
                && $request['messages'][0]['content'] === 'hello';
        });
    }

    public function test_it_throws_on_missing_message_content(): void
    {
        config()->set('openai.chat.api_key', 'chat-key');
        config()->set('openai.chat.base_uri', 'https://openrouter.ai/api/v1');
        config()->set('openai.chat.model', 'openrouter/model');

        Http::fake([
            'https://openrouter.ai/api/v1/chat/completions' => Http::response([
                'choices' => [
                    ['message' => []],
                ],
            ]),
        ]);

        $client = new OpenRouterChatCompletionClient();

        $this->expectException(ChatCompletionException::class);
        $this->expectExceptionMessage('missing choices[0].message.content');

        $client->complete([
            ['role' => 'user', 'content' => 'hello'],
        ]);
    }
}
