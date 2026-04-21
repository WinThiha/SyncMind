package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: Int,
    val name: String,
    val email: String,
    val email_verified_at: String? = null,
    val created_at: String,
    val updated_at: String
)
