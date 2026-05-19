package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Milestone(
    val id: Int,
    val project_id: Int,
    val name: String,
    val description: String? = null,
    val start_date: String? = null,
    val due_date: String? = null,
    val status: String,
    val is_overdue: Boolean = false,
    val progress: MilestoneProgress = MilestoneProgress(),
    val created_at: String,
    val updated_at: String
)

@Serializable
data class MilestoneProgress(
    val total: Int = 0,
    val completed: Int = 0,
    val percentage: Int = 0
)

@Serializable
data class SuggestMilestoneDatesRequest(
    val name: String,
    val description: String? = null,
    val context: String? = null
)

@Serializable
data class SuggestExistingMilestoneDatesRequest(
    val context: String? = null
)

@Serializable
data class MilestoneDateSuggestion(
    val start_date: String? = null,
    val due_date: String? = null,
    val rationale: String
)

@Serializable
data class MilestoneDateSuggestionResponse(
    val data: MilestoneDateSuggestion
)

@Serializable
data class MilestoneAiRequest(
    val force: Boolean = false
)

@Serializable
data class MilestoneSummaryResult(
    val summary: String,
    val generated_at: String? = null
)

@Serializable
data class MilestoneSummaryResponse(
    val data: MilestoneSummaryResult,
    val cached: Boolean = false
)

@Serializable
data class MilestoneRiskResult(
    val verdict: String,
    val signals: List<String> = emptyList(),
    val recommendation: String,
    val generated_at: String? = null
)

@Serializable
data class MilestoneRiskResponse(
    val data: MilestoneRiskResult,
    val cached: Boolean = false
)

@Serializable
data class SuggestMilestoneIssuesRequest(
    val limit: Int = 10
)

@Serializable
data class MilestoneIssueSuggestion(
    val issue_id: Int,
    val key: String,
    val summary: String,
    val score: Double,
    val reason: String
)

@Serializable
data class MilestoneIssueSuggestionsResponse(
    val data: List<MilestoneIssueSuggestion>
)
