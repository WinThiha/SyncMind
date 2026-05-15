<?php

namespace App\Observers;

use App\Jobs\GenerateWikiEmbeddingJob;
use App\Models\WikiPage;

class WikiPageObserver
{
    public function created(WikiPage $wikiPage): void
    {
        GenerateWikiEmbeddingJob::dispatch($wikiPage);
    }

    public function updated(WikiPage $wikiPage): void
    {
        if (array_intersect(['title', 'content'], array_keys($wikiPage->getDirty()))) {
            GenerateWikiEmbeddingJob::dispatch($wikiPage);
        }
    }
}
