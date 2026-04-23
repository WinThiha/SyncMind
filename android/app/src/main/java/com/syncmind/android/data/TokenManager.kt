package com.syncmind.android.data

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.syncmind.android.data.model.User
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences = EncryptedSharedPreferences.create(
        context,
        "auth_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) {
        sharedPreferences.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString(KEY_TOKEN, null)
    }

    fun deleteToken() {
        sharedPreferences.edit().remove(KEY_TOKEN).apply()
    }

    fun saveUser(user: User) {
        val json = Json.encodeToString(user)
        sharedPreferences.edit().putString(KEY_USER, json).apply()
    }

    fun getUser(): User? {
        val json = sharedPreferences.getString(KEY_USER, null) ?: return null
        return try {
            Json.decodeFromString<User>(json)
        } catch (e: Exception) {
            null
        }
    }

    fun deleteUser() {
        sharedPreferences.edit().remove(KEY_USER).apply()
    }

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER = "user_data"
    }
}
