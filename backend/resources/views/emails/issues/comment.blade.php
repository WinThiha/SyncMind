<x-mail::message>
# New Comment on {{ $issue->full_key }}

{{ $comment->user->name }} added a comment to **{{ $issue->summary }}**.

<x-mail::panel>
{{ $comment->content }}
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/projects/' . $issue->project_id . '/issues/' . $issue->full_key">
View Issue
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
