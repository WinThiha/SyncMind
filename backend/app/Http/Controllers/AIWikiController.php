<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WikiPage;
use App\Services\AIWikiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIWikiController extends Controller
{
    public function __construct(private AIWikiService $wikiAI) {}

    public function chat(Request $request, Project $project): JsonResponse
    {
        if ($request->user()->cannot('viewAny', [WikiPage::class, $project])) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array|max:20',
            'history.*.role' => 'required|in:user,assistant',
            'history.*.content' => 'required|string',
            'locale' => 'nullable|string|max:10',
        ]);

        $answer = $this->wikiAI->chat(
            $project,
            $validated['message'],
            $validated['history'] ?? [],
            $validated['locale'] ?? 'en'
        );

        return response()->json(['answer' => $answer]);
    }

    public function draft(Request $request, Project $project): JsonResponse
    {
        if ($request->user()->cannot('create', [WikiPage::class, $project])) {
            abort(403);
        }

        $validated = $request->validate([
            'prompt' => 'required|string|max:500',
            'locale' => 'nullable|string|max:10',
        ]);

        $content = $this->wikiAI->draft($project, $validated['prompt'], $validated['locale'] ?? 'en');

        return response()->json(['content' => $content]);
    }
}
