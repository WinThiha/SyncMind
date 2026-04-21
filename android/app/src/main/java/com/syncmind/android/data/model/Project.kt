package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Project(
    val id: Int,
    val name: String,
    val description: String? = null,
    val status: String,
    val user_id: Int,
    val created_at: String,
    val updated_at: String
)
