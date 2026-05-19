package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
    val device_name: String
)

@Serializable
data class GoogleCallbackRequest(
    val token: String? = null,
    val id_token: String? = null,
    val device_name: String
)

@Serializable
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val password_confirmation: String,
    val social_id: String? = null,
    val social_provider: String? = null
)

@Serializable
data class ForgotPasswordRequest(
    val email: String
)

@Serializable
data class ResetPasswordRequest(
    val token: String,
    val email: String,
    val password: String,
    val password_confirmation: String
)
