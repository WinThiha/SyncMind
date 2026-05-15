<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class WikiPageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'title' => $this->faker->words(4, true),
            'content' => $this->faker->paragraphs(3, true),
            'author_id' => User::factory(),
            'last_editor_id' => null,
        ];
    }
}
