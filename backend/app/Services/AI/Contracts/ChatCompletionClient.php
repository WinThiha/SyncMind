<?php

namespace App\Services\AI\Contracts;

interface ChatCompletionClient
{
    /**
     * @param array<int, array{role: string, content: string}> $messages
     * @param array<string, mixed> $options
     */
    public function complete(array $messages, array $options = []): string;
}
