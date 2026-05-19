package com.syncmind.android.data.repository

import com.syncmind.android.data.TokenManager
import com.syncmind.android.data.api.SettingsApiService
import com.syncmind.android.data.model.SettingsProfileUpdate
import com.syncmind.android.data.model.SettingsPreferences
import com.syncmind.android.data.model.SettingsNotifications
import com.syncmind.android.data.model.UpdateUserSettingsRequest
import com.syncmind.android.data.model.UpdatePasswordRequest
import com.syncmind.android.data.model.UserSettings
import com.syncmind.android.util.NetworkResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SettingsRepository @Inject constructor(
    private val apiService: SettingsApiService,
    private val tokenManager: TokenManager
) {
    suspend fun getSettings(): NetworkResult<UserSettings> {
        return try {
            val response = apiService.getSettings()
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun updateSettings(
        name: String,
        preferences: SettingsPreferences,
        notifications: SettingsNotifications
    ): NetworkResult<UserSettings> {
        return try {
            val response = apiService.updateSettings(
                UpdateUserSettingsRequest(
                    profile = SettingsProfileUpdate(name = name),
                    preferences = preferences,
                    notifications = notifications
                )
            )
            if (response.isSuccessful && response.body() != null) {
                val settings = response.body()!!.data
                tokenManager.getUser()?.let { user ->
                    tokenManager.saveUser(user.copy(name = settings.profile.name))
                }
                NetworkResult.Success(settings)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun updatePassword(
        currentPassword: String,
        newPassword: String,
        newPasswordConfirmation: String
    ): NetworkResult<String> {
        return try {
            val response = apiService.updatePassword(
                UpdatePasswordRequest(
                    current_password = currentPassword,
                    new_password = newPassword,
                    new_password_confirmation = newPasswordConfirmation
                )
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.message)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun resendVerificationEmail(): NetworkResult<String> {
        return try {
            val response = apiService.resendVerificationEmail()
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                NetworkResult.Success(body.message ?: body.status ?: "Verification email sent")
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }
}
