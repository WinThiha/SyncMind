package com.syncmind.android.data.api

import com.syncmind.android.data.model.UpdateUserSettingsRequest
import com.syncmind.android.data.model.UpdatePasswordRequest
import com.syncmind.android.data.model.UpdatePasswordResponse
import com.syncmind.android.data.model.UserSettingsResponse
import com.syncmind.android.data.model.VerificationEmailResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT

interface SettingsApiService {
    @GET("user/settings")
    suspend fun getSettings(): Response<UserSettingsResponse>

    @PUT("user/settings")
    suspend fun updateSettings(
        @Body request: UpdateUserSettingsRequest
    ): Response<UserSettingsResponse>

    @PUT("user/settings/password")
    suspend fun updatePassword(
        @Body request: UpdatePasswordRequest
    ): Response<UpdatePasswordResponse>

    @POST("auth/email/verification-notification")
    suspend fun resendVerificationEmail(): Response<VerificationEmailResponse>
}
