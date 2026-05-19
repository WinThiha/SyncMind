package com.syncmind.android.data.model

import kotlinx.serialization.Serializable

@Serializable
data class UserSettingsResponse(
    val data: UserSettings
)

@Serializable
data class UserSettings(
    val profile: SettingsProfile,
    val verification: SettingsVerification,
    val security: SettingsSecurity,
    val preferences: SettingsPreferences,
    val notifications: SettingsNotifications
)

@Serializable
data class SettingsProfile(
    val name: String,
    val email: String
)

@Serializable
data class SettingsVerification(
    val email_verified: Boolean
)

@Serializable
data class SettingsSecurity(
    val has_password_credential: Boolean,
    val has_social_login: Boolean
)

@Serializable
data class SettingsPreferences(
    val theme: String? = "system",
    val sidebar_collapsed_default: Boolean = false,
    val locale: String = "en"
)

@Serializable
data class SettingsNotifications(
    val email_mentions: Boolean = true,
    val email_issue_assigned: Boolean = true,
    val email_comment_replies: Boolean = true,
    val in_app_mentions: Boolean = true,
    val in_app_issue_assigned: Boolean = true,
    val in_app_comment_replies: Boolean = true
)

@Serializable
data class UpdateUserSettingsRequest(
    val profile: SettingsProfileUpdate? = null,
    val preferences: SettingsPreferences? = null,
    val notifications: SettingsNotifications? = null
)

@Serializable
data class SettingsProfileUpdate(
    val name: String
)

@Serializable
data class UpdatePasswordRequest(
    val current_password: String,
    val new_password: String,
    val new_password_confirmation: String
)

@Serializable
data class UpdatePasswordResponse(
    val message: String
)

@Serializable
data class VerificationEmailResponse(
    val status: String? = null,
    val message: String? = null
)
