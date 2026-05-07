<x-mail::message>
# {{ __('mail.issue_comment.heading', ['key' => $issue->full_key]) }}

{{ __('mail.issue_comment.intro', ['name' => $comment->user->name, 'summary' => $issue->summary]) }}

<x-mail::panel>
{{ $comment->content }}
</x-mail::panel>

<x-mail::button :url="config('app.frontend_url') . '/projects/' . $issue->project_id . '/issues/' . $issue->full_key">
{{ __('mail.issue_comment.cta') }}
</x-mail::button>

{{ __('mail.common.thanks') }},<br>
{{ config('app.name') }}
</x-mail::message>
