package com.syncmind.android.ui.settings

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.SettingsNotifications
import com.syncmind.android.data.model.SettingsPreferences
import com.syncmind.android.data.model.UserSettings
import com.syncmind.android.data.repository.SettingsRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val _settingsState = mutableStateOf<NetworkResult<UserSettings>>(NetworkResult.Loading)
    val settingsState: State<NetworkResult<UserSettings>> = _settingsState

    private val _saveState = mutableStateOf<NetworkResult<Unit>>(NetworkResult.Success(Unit))
    val saveState: State<NetworkResult<Unit>> = _saveState

    private val _passwordState = mutableStateOf<NetworkResult<String>?>(null)
    val passwordState: State<NetworkResult<String>?> = _passwordState

    private val _verificationEmailState = mutableStateOf<NetworkResult<String>?>(null)
    val verificationEmailState: State<NetworkResult<String>?> = _verificationEmailState

    private val _name = mutableStateOf("")
    val name: State<String> = _name

    private val _currentPassword = mutableStateOf("")
    val currentPassword: State<String> = _currentPassword

    private val _newPassword = mutableStateOf("")
    val newPassword: State<String> = _newPassword

    private val _newPasswordConfirmation = mutableStateOf("")
    val newPasswordConfirmation: State<String> = _newPasswordConfirmation

    private val _preferences = mutableStateOf(SettingsPreferences())
    val preferences: State<SettingsPreferences> = _preferences

    private val _notifications = mutableStateOf(SettingsNotifications())
    val notifications: State<SettingsNotifications> = _notifications

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _settingsState.value = NetworkResult.Loading
            when (val result = settingsRepository.getSettings()) {
                is NetworkResult.Success -> {
                    applyDrafts(result.data)
                    _settingsState.value = result
                }
                is NetworkResult.Error -> _settingsState.value = result
                is NetworkResult.Loading -> _settingsState.value = NetworkResult.Loading
            }
        }
    }

    fun onNameChange(value: String) {
        _name.value = value
    }

    fun onCurrentPasswordChange(value: String) {
        _currentPassword.value = value
    }

    fun onNewPasswordChange(value: String) {
        _newPassword.value = value
    }

    fun onNewPasswordConfirmationChange(value: String) {
        _newPasswordConfirmation.value = value
    }

    fun onThemeChange(value: String) {
        _preferences.value = _preferences.value.copy(theme = value)
    }

    fun onLocaleChange(value: String) {
        _preferences.value = _preferences.value.copy(locale = value)
    }

    fun onSidebarDefaultChange(value: Boolean) {
        _preferences.value = _preferences.value.copy(sidebar_collapsed_default = value)
    }

    fun updateNotification(key: String, value: Boolean) {
        val current = _notifications.value
        _notifications.value = when (key) {
            "email_mentions" -> current.copy(email_mentions = value)
            "email_issue_assigned" -> current.copy(email_issue_assigned = value)
            "email_comment_replies" -> current.copy(email_comment_replies = value)
            "in_app_mentions" -> current.copy(in_app_mentions = value)
            "in_app_issue_assigned" -> current.copy(in_app_issue_assigned = value)
            "in_app_comment_replies" -> current.copy(in_app_comment_replies = value)
            else -> current
        }
    }

    fun save() {
        val name = _name.value.trim()
        if (name.length < 2) {
            _saveState.value = NetworkResult.Error("Display name must be at least 2 characters")
            return
        }

        viewModelScope.launch {
            _saveState.value = NetworkResult.Loading
            when (val result = settingsRepository.updateSettings(name, _preferences.value, _notifications.value)) {
                is NetworkResult.Success -> {
                    applyDrafts(result.data)
                    _settingsState.value = result
                    _saveState.value = NetworkResult.Success(Unit)
                }
                is NetworkResult.Error -> _saveState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _saveState.value = NetworkResult.Loading
            }
        }
    }

    fun updatePassword() {
        val currentPassword = _currentPassword.value
        val newPassword = _newPassword.value
        val newPasswordConfirmation = _newPasswordConfirmation.value

        if (currentPassword.isBlank() || newPassword.isBlank() || newPasswordConfirmation.isBlank()) {
            _passwordState.value = NetworkResult.Error("Fill out all password fields")
            return
        }
        if (newPassword != newPasswordConfirmation) {
            _passwordState.value = NetworkResult.Error("New password confirmation does not match")
            return
        }

        viewModelScope.launch {
            _passwordState.value = NetworkResult.Loading
            when (val result = settingsRepository.updatePassword(currentPassword, newPassword, newPasswordConfirmation)) {
                is NetworkResult.Success -> {
                    _currentPassword.value = ""
                    _newPassword.value = ""
                    _newPasswordConfirmation.value = ""
                    _passwordState.value = result
                }
                is NetworkResult.Error -> _passwordState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _passwordState.value = NetworkResult.Loading
            }
        }
    }

    fun resendVerificationEmail() {
        viewModelScope.launch {
            _verificationEmailState.value = NetworkResult.Loading
            _verificationEmailState.value = settingsRepository.resendVerificationEmail()
        }
    }

    private fun applyDrafts(settings: UserSettings) {
        _name.value = settings.profile.name
        _preferences.value = settings.preferences.copy(theme = settings.preferences.theme ?: "system")
        _notifications.value = settings.notifications
    }
}
