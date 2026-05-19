package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class MilestonesResponse(
    val data: List<Milestone>
)

@Serializable
data class MilestoneResponse(
    val data: Milestone
)

@Serializable
data class CreateMilestoneRequest(
    val name: String,
    val description: String? = null,
    val start_date: String? = null,
    val due_date: String? = null,
    val status: String = "open"
)

@Serializable
data class UpdateMilestoneRequest(
    val name: String? = null,
    val description: String? = null,
    val start_date: String? = null,
    val due_date: String? = null,
    val status: String? = null
)
