package com.syncmind.android.ui.auth

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syncmind.android.data.model.RegisterRequest
import com.syncmind.android.data.repository.AuthRepository
import com.syncmind.android.util.NetworkResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _registerState = mutableStateOf<NetworkResult<Unit>>(NetworkResult.Success(Unit))
    val registerState: State<NetworkResult<Unit>> = _registerState

    private val _name = mutableStateOf("")
    val name: State<String> = _name

    private val _email = mutableStateOf("")
    val email: State<String> = _email

    private val _password = mutableStateOf("")
    val password: State<String> = _password

    private val _passwordConfirmation = mutableStateOf("")
    val passwordConfirmation: State<String> = _passwordConfirmation

    private val _socialProvider = mutableStateOf<String?>(null)
    private val _socialId = mutableStateOf<String?>(null)
    private val _isSocialRegistration = mutableStateOf(false)
    val isSocialRegistration: State<Boolean> = _isSocialRegistration

    fun onNameChange(value: String) { _name.value = value }
    fun onEmailChange(value: String) { _email.value = value }
    fun onPasswordChange(value: String) { _password.value = value }
    fun onPasswordConfirmationChange(value: String) { _passwordConfirmation.value = value }

    fun prepareSocialRegistration(name: String, email: String, provider: String, id: String) {
        if (_isSocialRegistration.value) {
            return
        }

        _name.value = name
        _email.value = email
        _socialProvider.value = provider
        _socialId.value = id
        _isSocialRegistration.value = true
    }

    fun register() {
        if (_name.value.isBlank() || _email.value.isBlank() || _password.value.isBlank()) {
            _registerState.value = NetworkResult.Error("Name, email, and password are required")
            return
        }

        if (_password.value != _passwordConfirmation.value) {
            _registerState.value = NetworkResult.Error("Passwords do not match")
            return
        }

        viewModelScope.launch {
            _registerState.value = NetworkResult.Loading
            when (val result = authRepository.register(
                RegisterRequest(
                    name = _name.value.trim(),
                    email = _email.value.trim(),
                    password = _password.value,
                    password_confirmation = _passwordConfirmation.value,
                    social_id = _socialId.value,
                    social_provider = _socialProvider.value
                )
            )) {
                is NetworkResult.Success -> _registerState.value = NetworkResult.Success(Unit)
                is NetworkResult.Error -> _registerState.value = NetworkResult.Error(result.message, result.code)
                is NetworkResult.Loading -> _registerState.value = NetworkResult.Loading
            }
        }
    }
}
