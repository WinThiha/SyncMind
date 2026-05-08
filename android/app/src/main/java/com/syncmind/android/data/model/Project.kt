package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Project(
    val id: Int,
    val name: String,
    val key: String,
    val icon: String? = null,
    val issue_types: List<String> = emptyList(),
    val categories: List<String>? = null,
    val milestones: List<String>? = null,
    val versions: List<String>? = null,
    val creator_id: Int,
    val created_at: String,
    val updated_at: String
)
