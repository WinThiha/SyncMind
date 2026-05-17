<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OpenAI API Key and Organization
    |--------------------------------------------------------------------------
    |
    | Here you may specify your OpenAI API Key and organization. This will be
    | used to authenticate with the OpenAI API - you can find your API key
    | and organization on your OpenAI dashboard, at https://openai.com.
    */

    'api_key' => env('AI_API_KEY', env('OPENAI_API_KEY')),
    'organization' => env('OPENAI_ORGANIZATION'),

    /*
    |--------------------------------------------------------------------------
    | Base URI (for OpenRouter / custom OpenAI-compatible endpoints)
    |--------------------------------------------------------------------------
    |
    | Override the base URI to use OpenRouter, Groq, LM Studio, or any other
    | OpenAI-compatible API. Set AI_BASE_URL in your .env file.
    */

    'base_uri' => env('AI_BASE_URL', 'api.openai.com/v1'),

    /*
    |--------------------------------------------------------------------------
    | Chat Provider
    |--------------------------------------------------------------------------
    |
    | Chat-specific provider lane. New AI_CHAT_* keys are preferred and
    | fallback to legacy AI_* keys to preserve compatibility during migration.
    */

    'chat' => [
        'provider' => env('AI_CHAT_PROVIDER', 'openrouter'),
        'api_key' => env('AI_CHAT_API_KEY', env('AI_API_KEY', env('OPENAI_API_KEY'))),
        'base_uri' => env('AI_CHAT_BASE_URL', env('AI_BASE_URL', 'https://openrouter.ai/api/v1')),
        'model' => env('AI_CHAT_MODEL', env('AI_MODEL', 'gpt-4o-mini')),
    ],

    /*
    |--------------------------------------------------------------------------
    | Embedding Provider (OpenAI-Compatible)
    |--------------------------------------------------------------------------
    |
    | Dedicated embedding lane with independent credentials and endpoint.
    | New keys are preferred, then legacy AI keys are used as fallback.
    */

    'embedding' => [
        'api_key' => env('AI_EMBEDDING_API_KEY', env('AI_API_KEY', env('OPENAI_API_KEY'))),
        'base_uri' => env('AI_EMBEDDING_BASE_URL', env('AI_BASE_URL', 'https://api.openai.com/v1')),
        'model' => env('AI_EMBEDDING_MODEL', env('AI_MODEL', 'text-embedding-3-small')),
        'dimensions' => env('AI_EMBEDDING_DIMENSIONS', 768),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Model
    |--------------------------------------------------------------------------
    */

    'model' => env('AI_MODEL', 'gpt-4o-mini'),

    /*
    |--------------------------------------------------------------------------
    | Request Timeout
    |--------------------------------------------------------------------------
    |
    | The timeout may be used to specify the maximum number of seconds to wait
    | for a response. By default, the client will time out after 30 seconds.
    */

    'request_timeout' => env('OPENAI_REQUEST_TIMEOUT', 120),
];
