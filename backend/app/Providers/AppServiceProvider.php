<?php

namespace App\Providers;

use App\Models\Comment;
use App\Models\Issue;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\User;
use App\Observers\CommentObserver;
use App\Observers\IssueObserver;
use App\Observers\UserObserver;
use App\Policies\IssuePolicy;
use App\Policies\MilestonePolicy;
use App\Policies\ProjectPolicy;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('ai.client', function () {
            return \OpenAI::factory()
                ->withApiKey(config('openai.api_key', ''))
                ->withBaseUri(config('openai.base_uri', 'api.openai.com/v1'))
                ->withHttpHeader('HTTP-Referer', config('app.url'))
                ->withHttpHeader('X-Title', config('app.name'))
                ->make();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Policies
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Issue::class, IssuePolicy::class);
        Gate::policy(Milestone::class, MilestonePolicy::class);

        // Register Observers
        User::observe(UserObserver::class);
        Issue::observe(IssueObserver::class);
        Comment::observe(CommentObserver::class);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        VerifyEmail::createUrlUsing(function ($notifiable) {
            $frontendUrl = config('app.frontend_url') ?? 'http://localhost:3000';

            return $frontendUrl.'/verify-email?verify_url='.urlencode(URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
            ));
        });
    }
}
