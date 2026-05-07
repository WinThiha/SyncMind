<?php

namespace Tests\Unit;

use Tests\TestCase;

class OpenAIEmbeddingConfigTest extends TestCase
{
    public function test_embedding_config_uses_dedicated_lane_with_legacy_fallback_chain(): void
    {
        $configSource = file_get_contents(config_path('openai.php'));

        $this->assertNotFalse($configSource);
        $this->assertStringContainsString("'embedding' => [", $configSource);
        $this->assertStringContainsString("env('AI_EMBEDDING_API_KEY', env('AI_API_KEY', env('OPENAI_API_KEY')))", $configSource);
        $this->assertStringContainsString("env('AI_EMBEDDING_BASE_URL', env('AI_BASE_URL'", $configSource);
        $this->assertStringContainsString("env('AI_EMBEDDING_MODEL', env('AI_MODEL'", $configSource);
    }
}
