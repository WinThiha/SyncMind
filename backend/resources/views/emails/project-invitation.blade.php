<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Invitation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px 16px; }
        .container { max-width: 560px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
        .header { background: #3b82f6; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
        .body { padding: 40px 32px; }
        .body p { margin: 0 0 16px; color: #94a3b8; line-height: 1.6; font-size: 15px; }
        .body p strong { color: #e2e8f0; }
        .badge { display: inline-block; background: #3b82f620; border: 1px solid #3b82f640; color: #60a5fa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 6px; margin-bottom: 24px; }
        .btn { display: block; text-align: center; background: #3b82f6; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 16px 32px; border-radius: 12px; margin: 32px 0 0; letter-spacing: 0.5px; }
        .expiry { margin-top: 24px; padding: 16px; background: #0f172a; border-radius: 10px; font-size: 13px; color: #64748b; text-align: center; }
        .footer { padding: 24px 32px; border-top: 1px solid #334155; font-size: 12px; color: #475569; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SyncMind</h1>
        </div>
        <div class="body">
            <p>Hi there,</p>
            <p>
                <strong>{{ $invitation->inviter?->name ?? 'Someone' }}</strong> has invited you to join
                <strong>{{ $invitation->project->name }}</strong> on SyncMind as a
                <span class="badge">{{ $invitation->role }}</span>
            </p>
            <p>Click the button below to accept the invitation and get started.</p>
            <a href="{{ $acceptUrl }}" class="btn">Accept Invitation</a>
            <div class="expiry">
                This invitation expires on {{ $invitation->expires_at->format('F j, Y \a\t g:i A') }}.
            </div>
        </div>
        <div class="footer">
            If you weren't expecting this invitation, you can safely ignore this email.<br>
            &copy; {{ date('Y') }} SyncMind. All rights reserved.
        </div>
    </div>
</body>
</html>
