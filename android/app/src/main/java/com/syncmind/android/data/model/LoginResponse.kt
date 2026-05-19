package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginResponse(
    val token: String,
    val user: User
)

@Serializable
data class RegisterResponse(
    val message: String,
    val user: User,
    val token: String? = null
)

@Serializable
data class MessageResponse(
    val message: String
)

@Serializable
data class GoogleCallbackError(
    val message: String,
    val social_user: GoogleSocialUser? = null
)

@Serializable
data class GoogleSocialUser(
    val email: String,
    val name: String? = null,
    val provider_id: String,
    val provider_name: String
)
