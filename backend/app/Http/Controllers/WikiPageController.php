<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WikiPage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WikiPageController extends Controller
{
    use AuthorizesRequests;

    public function index(Project $project): JsonResponse
    {
        $this->authorize('viewAny', [WikiPage::class, $project]);

        $pages = $project->wikiPages()
            ->with(['author:id,name', 'lastEditor:id,name'])
            ->orderBy('title')
            ->get(['id', 'project_id', 'title', 'author_id', 'last_editor_id', 'created_at', 'updated_at']);

        return response()->json(['data' => $pages]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('create', [WikiPage::class, $project]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        $page = $project->wikiPages()->create([
            ...$validated,
            'author_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $page->load(['author:id,name', 'lastEditor:id,name'])], 201);
    }

    public function show(Project $project, WikiPage $wikiPage): JsonResponse
    {
        $this->authorize('view', $wikiPage);

        return response()->json(['data' => $wikiPage->load(['author:id,name', 'lastEditor:id,name'])]);
    }

    public function update(Request $request, Project $project, WikiPage $wikiPage): JsonResponse
    {
        $this->authorize('update', $wikiPage);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
        ]);

        $wikiPage->update([
            ...$validated,
            'last_editor_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $wikiPage->fresh()->load(['author:id,name', 'lastEditor:id,name'])]);
    }

    public function destroy(Project $project, WikiPage $wikiPage): JsonResponse
    {
        $this->authorize('delete', $wikiPage);

        $wikiPage->delete();

        return response()->json(null, 204);
    }
}
