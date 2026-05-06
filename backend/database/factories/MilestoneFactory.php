<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class MilestoneFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('now', '+1 month');
        $due = $this->faker->dateTimeBetween($start, '+3 months');

        return [
            'project_id' => Project::factory(),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'start_date' => $start->format('Y-m-d'),
            'due_date' => $due->format('Y-m-d'),
            'status' => $this->faker->randomElement(['open', 'in_progress', 'closed']),
        ];
    }
}
