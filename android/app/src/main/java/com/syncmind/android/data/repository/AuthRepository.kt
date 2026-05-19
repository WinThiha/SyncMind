package com.syncmind.android.data.repository

import com.syncmind.android.data.api.AuthApiService
import com.syncmind.android.data.model.ForgotPasswordRequest
import com.syncmind.android.data.model.GoogleCallbackError
import com.syncmind.android.data.model.GoogleCallbackRequest
import com.syncmind.android.data.model.GoogleSocialUser
import com.syncmind.android.data.model.LoginRequest
import com.syncmind.android.data.model.LoginResponse
import com.syncmind.android.data.model.RegisterRequest
import com.syncmind.android.data.model.ResetPasswordRequest
import com.syncmind.android.data.TokenManager
import com.syncmind.android.util.NetworkResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: AuthApiService,
    private val tokenManager: TokenManager,
    private val json: Json
) {
    suspend fun register(request: RegisterRequest): NetworkResult<LoginResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val registerResponse = apiService.register(request)
                if (registerResponse.isSuccessful) {
                    login(
                        LoginRequest(
                            email = request.email,
                            password = request.password,
                            device_name = android.os.Build.MODEL
                        )
                    )
                } else {
                    NetworkResult.Error(registerResponse.message(), registerResponse.code())
                }
            } catch (e: Exception) {
                NetworkResult.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    suspend fun login(request: LoginRequest): NetworkResult<LoginResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.login(request)
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    tokenManager.saveToken(body.token)
                    tokenManager.saveUser(body.user)
                    NetworkResult.Success(body)
                } else {
                    NetworkResult.Error(response.message(), response.code())
                }
            } catch (e: Exception) {
                NetworkResult.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    suspend fun loginWithGoogleToken(accessToken: String): NetworkResult<LoginResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.googleCallback(
                    GoogleCallbackRequest(
                        token = accessToken,
                        device_name = android.os.Build.MODEL
                    )
                )
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    tokenManager.saveToken(body.token)
                    tokenManager.saveUser(body.user)
                    NetworkResult.Success(body)
                } else {
                    val errorPayload = response.errorBody()?.string()
                    val message = parseGoogleCallbackError(errorPayload)?.message ?: response.message()
                    NetworkResult.Error(message, response.code(), errorPayload)
                }
            } catch (e: Exception) {
                NetworkResult.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    fun parseGoogleSocialUser(errorPayload: String?): GoogleSocialUser? {
        return parseGoogleCallbackError(errorPayload)?.social_user
    }

    suspend fun loginWithGoogleIdToken(idToken: String): NetworkResult<LoginResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.googleCallback(
                    GoogleCallbackRequest(
                        id_token = idToken,
                        device_name = android.os.Build.MODEL
                    )
                )
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    tokenManager.saveToken(body.token)
                    tokenManager.saveUser(body.user)
                    NetworkResult.Success(body)
                } else {
                    NetworkResult.Error(response.message(), response.code())
                }
            } catch (e: Exception) {
                NetworkResult.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    suspend fun logout(): NetworkResult<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.logout()
                if (response.isSuccessful) {
                    tokenManager.deleteToken()
                    tokenManager.deleteUser()
                    NetworkResult.Success(Unit)
                } else {
                    NetworkResult.Error(response.message(), response.code())
                }
            } catch (e: Exception) {
                NetworkResult.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    suspend fun forgotPassword(email: String): NetworkResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.forgotPassword(ForgotPasswordRequest(email = email))
                if (response.isSuccessful && response.body() != null) {
                    NetworkResult.Success(response.body()!!.message)
                } else {
                    NetworkResult.Error(response.message(), response.code())
                }
            } catch (e: Exception) {
                NetworkResult.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    suspend fun resetPassword(
        token: String,
        email: String,
        password: String,
        passwordConfirmation: String
    ): NetworkResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.resetPassword(
                    ResetPasswordRequest(
                        token = token,
                        email = email,
                        password = password,
                        password_confirmation = passwordConfirmation
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
    }

    suspend fun verifyEmail(verifyUrl: String): NetworkResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.verifyEmail(verifyUrl)
                if (response.isSuccessful && response.body() != null) {
                    NetworkResult.Success(response.body()!!.message)
                } else {
                    NetworkResult.Error(response.message(), response.code())
                }
            } catch (e: Exception) {
                NetworkResult.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    fun isLoggedIn(): Boolean {
        return tokenManager.getToken() != null
    }

    private fun parseGoogleCallbackError(errorPayload: String?): GoogleCallbackError? {
        if (errorPayload.isNullOrBlank()) {
            return null
        }

        return runCatching {
            json.decodeFromString<GoogleCallbackError>(errorPayload)
        }.getOrNull()
    }
}
