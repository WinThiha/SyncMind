package com.syncmind.android.ui.auth

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import com.syncmind.android.BuildConfig
import com.syncmind.android.data.model.GoogleSocialUser
import com.syncmind.android.ui.components.SyncMindCard
import com.syncmind.android.util.NetworkResult
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onRegisterClick: () -> Unit,
    onForgotPasswordClick: () -> Unit,
    onSocialRegister: (GoogleSocialUser) -> Unit,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val email by viewModel.email
    val password by viewModel.password
    val loginState by viewModel.loginState
    val authenticated by viewModel.authenticated
    val socialRegistrationUser by viewModel.socialRegistrationUser
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    LaunchedEffect(authenticated) {
        if (authenticated) {
            onLoginSuccess()
        }
    }

    LaunchedEffect(socialRegistrationUser) {
        socialRegistrationUser?.let(onSocialRegister)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "SyncMind", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.primary)
        Text(
            text = "Project work, issues, and AI assistance in one flow.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 6.dp, bottom = 24.dp)
        )

        SyncMindCard {
            Text(text = "Welcome back", style = MaterialTheme.typography.titleLarge)

            OutlinedTextField(
                value = email,
                onValueChange = viewModel::onEmailChange,
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                singleLine = true
            )

            OutlinedTextField(
                value = password,
                onValueChange = viewModel::onPasswordChange,
                label = { Text("Password") },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                singleLine = true
            )

            if (loginState is NetworkResult.Loading) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
            } else {
                OutlinedButton(
                    onClick = {
                        val activity = context.findActivity()
                        if (activity == null) {
                            viewModel.onGoogleLoginError("Google sign-in requires an active screen")
                            return@OutlinedButton
                        }
                        if (BuildConfig.GOOGLE_WEB_CLIENT_ID.isBlank()) {
                            viewModel.onGoogleLoginError("Google sign-in is not configured")
                            return@OutlinedButton
                        }

                        scope.launch {
                            val credentialManager = CredentialManager.create(context)
                            val googleOption = GetSignInWithGoogleOption.Builder(
                                serverClientId = BuildConfig.GOOGLE_WEB_CLIENT_ID
                            ).build()
                            val request = GetCredentialRequest.Builder()
                                .addCredentialOption(googleOption)
                                .build()

                            try {
                                val result = credentialManager.getCredential(
                                    request = request,
                                    context = activity
                                )
                                val credential = result.credential
                                if (
                                    credential is CustomCredential &&
                                    credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                                ) {
                                    val googleCredential = GoogleIdTokenCredential.createFrom(credential.data)
                                    viewModel.loginWithGoogleIdToken(googleCredential.idToken)
                                } else {
                                    viewModel.onGoogleLoginError("Unsupported Google credential")
                                }
                            } catch (e: GoogleIdTokenParsingException) {
                                viewModel.onGoogleLoginError("Invalid Google credential")
                            } catch (e: GetCredentialException) {
                                viewModel.onGoogleLoginError(e.message ?: "Google sign-in failed")
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.medium
                ) {
                    Text("Continue with Google")
                }

                Button(
                    onClick = viewModel::login,
                    modifier = Modifier.fillMaxWidth(),
                    shape = MaterialTheme.shapes.medium
                ) {
                    Text("Login")
                }
                TextButton(onClick = onForgotPasswordClick, modifier = Modifier.fillMaxWidth()) { Text("Forgot password?") }
                TextButton(onClick = onRegisterClick, modifier = Modifier.fillMaxWidth()) { Text("Create an account") }
            }

            if (loginState is NetworkResult.Error) {
                Text(
                    text = (loginState as NetworkResult.Error).message,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

private tailrec fun Context.findActivity(): Activity? = when (this) {
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}
