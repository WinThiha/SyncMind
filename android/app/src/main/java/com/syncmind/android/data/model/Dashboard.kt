package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class DashboardResponse(
    val data: DashboardData
)

@Serializable
data class DashboardData(
    val summary: DashboardSummary,
    val my_work: List<DashboardIssuePreview> = emptyList(),
    val upcoming: List<DashboardIssuePreview> = emptyList(),
    val project_health: List<DashboardProjectHealth> = emptyList(),
    val recent_activity: List<DashboardActivity> = emptyList()
)

@Serializable
data class DashboardSummary(
    val active_projects: Int,
    val my_open_issues: Int,
    val due_soon: Int,
    val overdue: Int
)

@Serializable
data class DashboardIssuePreview(
    val id: Int,
    val project_id: Int,
    val project_name: String? = null,
    val project_key: String? = null,
    val key: String,
    val summary: String,
    val status: String,
    val priority: String,
    val due_date: String? = null,
    val updated_at: String? = null
)

@Serializable
data class DashboardProjectHealth(
    val id: Int,
    val name: String,
    val key: String,
    val members_count: Int,
    val issues_count: Int,
    val overdue_issues_count: Int,
    val progress: Int,
    val updated_at: String? = null
)

@Serializable
data class DashboardActivity(
    val type: String,
    val actor: String? = null,
    val issue_key: String? = null,
    val issue_summary: String? = null,
    val project_id: Int? = null,
    val project_name: String? = null,
    val created_at: String? = null,
    val field: String? = null,
    val old_value: String? = null,
    val new_value: String? = null,
    val text: String? = null
)
