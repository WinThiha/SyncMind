<?php

namespace App\Http\Controllers;

use App\Mail\IssueCommentNotification;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\Project;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class CommentController extends Controller
{
    use AuthorizesRequests;

    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request, Project $project, string $issueKey): JsonResponse
    {
        $issue = $this->findIssueByKey($project, $issueKey);

        $this->authorize('addComment', $issue);

        $validated = $request->validate([
            'content' => 'required|string',
            'notify_emails' => 'boolean',
        ]);

        $comment = Comment::create([
            'issue_id' => $issue->id,
            'user_id' => Auth::id(),
            'content' => $validated['content'],
        ]);

        if ($request->boolean('notify_emails')) {
            // In a real app, we might notify all project members or just specific ones.
            // For now, we'll notify the issue creator and assignee (if set).
            $recipients = collect([$issue->creator]);
            if ($issue->assignee) {
                $recipients->push($issue->assignee);
            }

            // Filter out the person who just commented
            $recipients = $recipients->filter(fn ($u) => $u->id !== Auth::id())->unique('id');

            foreach ($recipients as $recipient) {
                Mail::to($recipient->email)->send(new IssueCommentNotification($comment));
            }
        }

        return response()->json([
            'data' => $comment->load('user'),
        ], 201);
    }

    /**
     * Find an issue by project and key.
     */
    protected function findIssueByKey(Project $project, string $key): Issue
    {
        $parts = explode('-', $key);
        $keyNumber = end($parts);

        return $project->issues()
            ->where('key_number', $keyNumber)
            ->firstOrFail();
    }
}
