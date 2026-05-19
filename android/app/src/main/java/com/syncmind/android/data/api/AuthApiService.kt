package com.syncmind.android.data.api

import com.syncmind.android.data.model.ForgotPasswordRequest
import com.syncmind.android.data.model.GoogleCallbackRequest
import com.syncmind.android.data.model.LoginRequest
import com.syncmind.android.data.model.LoginResponse
import com.syncmind.android.data.model.MessageResponse
import com.syncmind.android.data.model.RegisterRequest
import com.syncmind.android.data.model.RegisterResponse
import com.syncmind.android.data.model.ResetPasswordRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Url

interface AuthApiService {
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/google/callback")
    suspend fun googleCallback(@Body request: GoogleCallbackRequest): Response<LoginResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<MessageResponse>

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<MessageResponse>

    @GET
    suspend fun verifyEmail(@Url verifyUrl: String): Response<MessageResponse>

    @POST("auth/logout")
    suspend fun logout(): Response<Unit>
}
