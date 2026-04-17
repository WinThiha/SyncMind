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
    | Vector Search Service (Gemini)
    |--------------------------------------------------------------------------
    */

    'vector' => [
        'base_uri' => env('AI_VECTOR_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/'),
        'model' => env('AI_VECTOR_MODEL', 'gemini-embedding-001'),
        'output_dimensionality' => env('AI_VECTOR_OUTPUT_DIMENSIONALITY', 768),
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

    'request_timeout' => env('OPENAI_REQUEST_TIMEOUT', 30),
];
