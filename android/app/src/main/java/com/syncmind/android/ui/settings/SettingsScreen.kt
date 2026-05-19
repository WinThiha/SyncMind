package com.syncmind.android.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.syncmind.android.data.model.UserSettings
import com.syncmind.android.ui.components.LoadingState
import com.syncmind.android.ui.components.SectionHeader
import com.syncmind.android.ui.components.SyncMindCard
import com.syncmind.android.ui.components.SyncMindDestination
import com.syncmind.android.ui.components.SyncMindScaffold
import com.syncmind.android.util.NetworkResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onDashboardClick: (() -> Unit)? = null,
    onProjectsClick: (() -> Unit)? = null,
    onIssuesClick: (() -> Unit)? = null,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val settingsState by viewModel.settingsState
    val saveState by viewModel.saveState
    val passwordState by viewModel.passwordState
    val verificationEmailState by viewModel.verificationEmailState
    val name by viewModel.name
    val currentPassword by viewModel.currentPassword
    val newPassword by viewModel.newPassword
    val newPasswordConfirmation by viewModel.newPasswordConfirmation
    val preferences by viewModel.preferences
    val notifications by viewModel.notifications

    SyncMindScaffold(
        title = "Project Flow",
        currentDestination = SyncMindDestination.Settings,
        onDashboardClick = onDashboardClick,
        onProjectsClick = onProjectsClick,
        onIssuesClick = onIssuesClick,
        onSettingsClick = viewModel::load,
        onBack = onBack,
        onRefresh = viewModel::load
    ) { paddingValues ->
        when (val state = settingsState) {
            is NetworkResult.Loading -> LoadingState("Loading settings")
            is NetworkResult.Error -> {
                Column(
                    modifier = Modifier.fillMaxSize().padding(paddingValues).padding(16.dp),
                    verticalArrangement = Arrangement.Center
                ) {
                    Text("Settings could not load", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                    Text(state.message, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp))
                    Button(onClick = viewModel::load, modifier = Modifier.padding(top = 12.dp)) { Text("Retry") }
                }
            }
            is NetworkResult.Success -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 96.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Text("Settings", style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
                        Text(
                            "Profile, preferences, notifications, and security.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                    item {
                        SyncMindCard {
                            AccountSection(
                                settings = state.data,
                                name = name,
                                verificationEmailState = verificationEmailState,
                                onNameChange = viewModel::onNameChange,
                                onResendVerificationEmail = viewModel::resendVerificationEmail
                            )
                        }
                    }
                    if (state.data.security.has_password_credential) {
                        item {
                            SyncMindCard {
                                PasswordSection(
                                    currentPassword = currentPassword,
                                    newPassword = newPassword,
                                    newPasswordConfirmation = newPasswordConfirmation,
                                    passwordState = passwordState,
                                    onCurrentPasswordChange = viewModel::onCurrentPasswordChange,
                                    onNewPasswordChange = viewModel::onNewPasswordChange,
                                    onNewPasswordConfirmationChange = viewModel::onNewPasswordConfirmationChange,
                                    onUpdatePassword = viewModel::updatePassword
                                )
                            }
                        }
                    }
                    item {
                        SyncMindCard {
                            PreferencesSection(
                                theme = preferences.theme ?: "system",
                                locale = preferences.locale,
                                sidebarDefault = preferences.sidebar_collapsed_default,
                                onThemeChange = viewModel::onThemeChange,
                                onLocaleChange = viewModel::onLocaleChange,
                                onSidebarDefaultChange = viewModel::onSidebarDefaultChange
                            )
                        }
                    }
                    item {
                        SyncMindCard {
                            NotificationsSection(
                                values = listOf(
                                    "email_mentions" to ("Email mentions" to notifications.email_mentions),
                                    "email_issue_assigned" to ("Email assigned issues" to notifications.email_issue_assigned),
                                    "email_comment_replies" to ("Email comment replies" to notifications.email_comment_replies),
                                    "in_app_mentions" to ("In-app mentions" to notifications.in_app_mentions),
                                    "in_app_issue_assigned" to ("In-app assigned issues" to notifications.in_app_issue_assigned),
                                    "in_app_comment_replies" to ("In-app comment replies" to notifications.in_app_comment_replies)
                                ),
                                onChange = viewModel::updateNotification
                            )
                        }
                    }
                    item {
                        if (state.data.security.has_password_credential) {
                            SaveStatus(saveState)
                        }
                        Button(
                            onClick = { viewModel.save() },
                            enabled = saveState !is NetworkResult.Loading,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(if (saveState is NetworkResult.Loading) "Saving..." else "Save settings")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PasswordSection(
    currentPassword: String,
    newPassword: String,
    newPasswordConfirmation: String,
    passwordState: NetworkResult<String>?,
    onCurrentPasswordChange: (String) -> Unit,
    onNewPasswordChange: (String) -> Unit,
    onNewPasswordConfirmationChange: (String) -> Unit,
    onUpdatePassword: () -> Unit
) {
    SectionTitle("Password")
    OutlinedTextField(
        value = currentPassword,
        onValueChange = onCurrentPasswordChange,
        label = { Text("Current password") },
        visualTransformation = PasswordVisualTransformation(),
        modifier = Modifier.fillMaxWidth(),
        singleLine = true
    )
    Spacer(modifier = Modifier.height(8.dp))
    OutlinedTextField(
        value = newPassword,
        onValueChange = onNewPasswordChange,
        label = { Text("New password") },
        visualTransformation = PasswordVisualTransformation(),
        modifier = Modifier.fillMaxWidth(),
        singleLine = true
    )
    Spacer(modifier = Modifier.height(8.dp))
    OutlinedTextField(
        value = newPasswordConfirmation,
        onValueChange = onNewPasswordConfirmationChange,
        label = { Text("Confirm new password") },
        visualTransformation = PasswordVisualTransformation(),
        modifier = Modifier.fillMaxWidth(),
        singleLine = true
    )
    Spacer(modifier = Modifier.height(8.dp))
    when (passwordState) {
        is NetworkResult.Error -> Text(
            text = passwordState.message,
            color = MaterialTheme.colorScheme.error,
            style = MaterialTheme.typography.bodyMedium
        )
        is NetworkResult.Success -> Text(
            text = passwordState.data,
            color = MaterialTheme.colorScheme.primary,
            style = MaterialTheme.typography.bodyMedium
        )
        is NetworkResult.Loading -> Unit
        null -> Unit
    }
    Spacer(modifier = Modifier.height(8.dp))
    Button(
        onClick = onUpdatePassword,
        enabled = passwordState !is NetworkResult.Loading,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(if (passwordState is NetworkResult.Loading) "Updating..." else "Update password")
    }
}

@Composable
private fun AccountSection(
    settings: UserSettings,
    name: String,
    verificationEmailState: NetworkResult<String>?,
    onNameChange: (String) -> Unit,
    onResendVerificationEmail: () -> Unit
) {
    SectionTitle("Account")
    OutlinedTextField(
        value = name,
        onValueChange = onNameChange,
        label = { Text("Display name") },
        modifier = Modifier.fillMaxWidth()
    )
    Spacer(modifier = Modifier.height(8.dp))
    Text(
        text = settings.profile.email,
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
    Spacer(modifier = Modifier.height(8.dp))
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        AssistChip(
            onClick = {},
            label = { Text(if (settings.verification.email_verified) "Email verified" else "Email not verified") }
        )
        AssistChip(
            onClick = {},
            label = { Text(if (settings.security.has_social_login) "Social login" else "Password account") }
        )
    }
    if (!settings.verification.email_verified) {
        Spacer(modifier = Modifier.height(8.dp))
        when (verificationEmailState) {
            is NetworkResult.Error -> Text(
                text = verificationEmailState.message,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium
            )
            is NetworkResult.Success -> Text(
                text = verificationEmailState.data,
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodyMedium
            )
            is NetworkResult.Loading -> Unit
            null -> Unit
        }
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = onResendVerificationEmail,
            enabled = verificationEmailState !is NetworkResult.Loading,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (verificationEmailState is NetworkResult.Loading) "Sending..." else "Resend verification email")
        }
    }
}

@Composable
private fun PreferencesSection(
    theme: String,
    locale: String,
    sidebarDefault: Boolean,
    onThemeChange: (String) -> Unit,
    onLocaleChange: (String) -> Unit,
    onSidebarDefaultChange: (Boolean) -> Unit
) {
    SectionTitle("Preferences")
    Text("Theme", style = MaterialTheme.typography.labelLarge)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("light", "dark", "system").forEach { option ->
            FilterChip(
                selected = theme == option,
                onClick = { onThemeChange(option) },
                label = { Text(option.capitalized()) }
            )
        }
    }
    Spacer(modifier = Modifier.height(12.dp))
    Text("Language", style = MaterialTheme.typography.labelLarge)
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        listOf("en", "my-MM", "ja-JP", "vi-VN", "km-KH").forEach { option ->
            FilterChip(
                selected = locale == option,
                onClick = { onLocaleChange(option) },
                label = { Text(option) }
            )
        }
    }
    SettingSwitch(
        label = "Collapse sidebar by default",
        checked = sidebarDefault,
        onCheckedChange = onSidebarDefaultChange
    )
}

@Composable
private fun NotificationsSection(
    values: List<Pair<String, Pair<String, Boolean>>>,
    onChange: (String, Boolean) -> Unit
) {
    SectionTitle("Notifications")
    values.forEach { (key, labelAndValue) ->
        SettingSwitch(
            label = labelAndValue.first,
            checked = labelAndValue.second,
            onCheckedChange = { onChange(key, it) }
        )
    }
}

@Composable
private fun SettingSwitch(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = MaterialTheme.typography.bodyMedium)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
private fun SectionTitle(text: String) {
    SectionHeader(text)
}

@Composable
private fun SectionDivider() {
    Spacer(modifier = Modifier.height(20.dp))
    HorizontalDivider()
    Spacer(modifier = Modifier.height(20.dp))
}

@Composable
private fun SaveStatus(saveState: NetworkResult<Unit>) {
    when (saveState) {
        is NetworkResult.Error -> Text(
            text = saveState.message,
            color = MaterialTheme.colorScheme.error,
            style = MaterialTheme.typography.bodyMedium
        )
        is NetworkResult.Success -> Unit
        is NetworkResult.Loading -> Unit
    }
    Spacer(modifier = Modifier.height(8.dp))
}

private fun String.capitalized(): String = replaceFirstChar { it.uppercase() }
