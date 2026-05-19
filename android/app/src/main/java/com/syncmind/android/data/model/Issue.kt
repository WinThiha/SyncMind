package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Issue(
    val id: Int,
    val project_id: Int,
    val key: String,
    val key_number: Int,
    val summary: String,
    val description: String? = null,
    val status: String,
    val priority: String,
    val issue_type: String,
    val estimated_hours: Double? = null,
    val actual_hours: Double? = null,
    val assignee_id: Int? = null,
    val milestone_id: Int? = null,
    val due_date: String? = null,
    val creator_id: Int,
    val created_at: String,
    val updated_at: String,
    val comments_count: Int? = null,
    val project_name: String? = null,
    val project_key: String? = null,
    val assignee: User? = null,
    val creator: User? = null,
    val comments: List<IssueComment> = emptyList(),
    val history: List<IssueHistory> = emptyList()
)

@Serializable
data class IssueComment(
    val id: Int,
    val issue_id: Int? = null,
    val user_id: Int? = null,
    val content: String,
    val created_at: String,
    val updated_at: String,
    val user: User? = null
)

@Serializable
data class IssueHistory(
    val id: Int,
    val issue_id: Int? = null,
    val user_id: Int? = null,
    val field: String? = null,
    val old_value: String? = null,
    val new_value: String? = null,
    val created_at: String,
    val updated_at: String? = null,
    val user: User? = null
)

@Serializable
data class CreateIssueCommentRequest(
    val content: String
)

@Serializable
data class SummarizeIssueRequest(
    val force: Boolean = false
)

@Serializable
data class ThreadSummary(
    val summary: String,
    val decisions: List<String> = emptyList(),
    val consensus: String? = null,
    val action_items: List<String> = emptyList()
)

@Serializable
data class ThreadSummaryResponse(
    val data: ThreadSummary,
    val cached: Boolean = false
)

@Serializable
data class SuggestIssueRequest(
    val summary: String
)

@Serializable
data class AssigneeSuggestion(
    val assignee_id: Int,
    val reason: String
)

@Serializable
data class IssueAISuggestion(
    val description: String? = null,
    val issue_type: String? = null,
    val priority: String? = null,
    val estimated_hours: Double? = null,
    val assignee_suggestions: List<AssigneeSuggestion> = emptyList()
)

@Serializable
data class IssueAISuggestionResponse(
    val data: IssueAISuggestion
)

@Serializable
data class SimilarIssue(
    val id: Int,
    val project_id: Int,
    val key: String? = null,
    val full_key: String? = null,
    val key_number: Int,
    val summary: String,
    val description: String? = null,
    val status: String,
    val priority: String,
    val issue_type: String? = null,
    val due_date: String? = null,
    val updated_at: String? = null,
    val comments_count: Int? = null,
    val similarity: Double,
    val project_name: String? = null,
    val project_key: String? = null,
    val assignee_id: Int? = null,
    val assignee: User? = null
)

@Serializable
data class SimilarIssuesResponse(
    val data: List<SimilarIssue>
)

@Serializable
data class IssuesSummary(
    val assigned_to_me: Int,
    val overdue: Int,
    val high_priority: Int,
    val unassigned: Int,
    val project_name: String
)

@Serializable
data class IssuesSummaryResponse(
    val data: IssuesSummary
)

@Serializable
data class IssueCommentResponse(
    val data: IssueComment
)

@Serializable
data class CreateIssueRequest(
    val summary: String,
    val description: String? = null,
    val issue_type: String,
    val priority: String = "normal",
    val status: String = "open",
    val estimated_hours: Double? = null,
    val due_date: String? = null
)

@Serializable
data class UpdateIssueRequest(
    val summary: String? = null,
    val description: String? = null,
    val issue_type: String? = null,
    val priority: String? = null,
    val status: String? = null,
    val estimated_hours: Double? = null,
    val actual_hours: Double? = null,
    val due_date: String? = null
)
