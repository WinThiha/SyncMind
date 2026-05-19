package com.syncmind.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.syncmind.android.ui.theme.PriorityHigh
import com.syncmind.android.ui.theme.PriorityLow
import com.syncmind.android.ui.theme.PriorityNormal
import com.syncmind.android.ui.theme.StatusClosed
import com.syncmind.android.ui.theme.StatusInProgress
import com.syncmind.android.ui.theme.StatusOpen
import com.syncmind.android.ui.theme.StatusResolved

enum class SyncMindDestination {
    Dashboard,
    Projects,
    Issues,
    Settings
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SyncMindScaffold(
    title: String,
    currentDestination: SyncMindDestination? = null,
    onDashboardClick: (() -> Unit)? = null,
    onProjectsClick: (() -> Unit)? = null,
    onIssuesClick: (() -> Unit)? = null,
    onSettingsClick: (() -> Unit)? = null,
    onBack: (() -> Unit)? = null,
    onRefresh: (() -> Unit)? = null,
    floatingAction: (() -> Unit)? = null,
    floatingActionContentDescription: String = "Add",
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Surface(
                            shape = RoundedCornerShape(999.dp),
                            color = MaterialTheme.colorScheme.primaryContainer,
                            contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                        ) {
                            Icon(
                                imageVector = Icons.Default.AccountCircle,
                                contentDescription = null,
                                modifier = Modifier.padding(5.dp).size(22.dp)
                            )
                        }
                        Text(
                            text = title,
                            style = MaterialTheme.typography.headlineMedium,
                            color = MaterialTheme.colorScheme.primary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                },
                navigationIcon = {
                    if (onBack != null) {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                },
                actions = {
                    if (onRefresh != null) {
                        IconButton(onClick = onRefresh) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                        }
                    }
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.primary
                )
            )
        },
        bottomBar = {
            if (currentDestination != null) {
                SyncMindBottomBar(
                    currentDestination = currentDestination,
                    onDashboardClick = onDashboardClick,
                    onProjectsClick = onProjectsClick,
                    onIssuesClick = onIssuesClick,
                    onSettingsClick = onSettingsClick
                )
            }
        },
        floatingActionButton = {
            if (floatingAction != null) {
                FloatingActionButton(
                    onClick = floatingAction,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                    shape = RoundedCornerShape(18.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = floatingActionContentDescription)
                }
            }
        },
        content = content
    )
}

@Composable
private fun SyncMindBottomBar(
    currentDestination: SyncMindDestination,
    onDashboardClick: (() -> Unit)?,
    onProjectsClick: (() -> Unit)?,
    onIssuesClick: (() -> Unit)?,
    onSettingsClick: (() -> Unit)?
) {
    Surface(
        color = MaterialTheme.colorScheme.surfaceVariant,
        tonalElevation = 8.dp
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
        SyncMindNavItem(
            selected = currentDestination == SyncMindDestination.Dashboard,
            icon = Icons.Default.Home,
            label = "Dashboard",
            onClick = onDashboardClick
        )
        SyncMindNavItem(
            selected = currentDestination == SyncMindDestination.Projects,
            icon = Icons.AutoMirrored.Filled.List,
            label = "Projects",
            onClick = onProjectsClick
        )
        SyncMindNavItem(
            selected = currentDestination == SyncMindDestination.Issues,
            icon = Icons.AutoMirrored.Filled.List,
            label = "Issues",
            onClick = onIssuesClick
        )
        SyncMindNavItem(
            selected = currentDestination == SyncMindDestination.Settings,
            icon = Icons.Default.Settings,
            label = "Settings",
            onClick = onSettingsClick
        )
        }
    }
}

@Composable
private fun SyncMindNavItem(
    selected: Boolean,
    icon: ImageVector,
    label: String,
    onClick: (() -> Unit)?
) {
    val container = if (selected) MaterialTheme.colorScheme.secondaryContainer else Color.Transparent
    val content = if (selected) MaterialTheme.colorScheme.onSecondaryContainer else MaterialTheme.colorScheme.onSurfaceVariant

    Column(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(container)
            .clickable(enabled = onClick != null) { onClick?.invoke() }
            .padding(horizontal = if (selected) 14.dp else 10.dp, vertical = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        Icon(icon, contentDescription = label, tint = content, modifier = Modifier.size(22.dp))
        Text(
            label,
            style = MaterialTheme.typography.labelMedium,
            color = content,
            maxLines = 1
        )
    }
}

@Composable
fun SyncMindScreen(
    paddingValues: PaddingValues,
    contentPadding: PaddingValues = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(contentPadding),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        content = content
    )
}

@Composable
fun SyncMindCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            content = content
        )
    }
}

@Composable
fun MetricCard(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    containerColor: Color = MaterialTheme.colorScheme.surfaceVariant,
    contentColor: Color = MaterialTheme.colorScheme.onSurface
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(containerColor)
            .padding(16.dp)
            .heightIn(min = 92.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        if (icon != null) {
            Icon(icon, contentDescription = null, tint = contentColor, modifier = Modifier.size(22.dp))
        } else {
            Spacer(modifier = Modifier.height(22.dp))
        }
        Column {
            Text(value, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = contentColor)
            Text(label.uppercase(), style = MaterialTheme.typography.labelMedium, color = contentColor.copy(alpha = 0.72f))
        }
    }
}

@Composable
fun SectionHeader(text: String, action: String? = null, onAction: (() -> Unit)? = null) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(text, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
        if (action != null && onAction != null) {
            Text(
                text = action.uppercase(),
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.clickable(onClick = onAction).padding(8.dp)
            )
        }
    }
}

@Composable
fun StatusChip(value: String, modifier: Modifier = Modifier) {
    val color = statusColor(value)
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(999.dp),
        color = color.copy(alpha = 0.12f),
        contentColor = color,
        border = BorderStroke(1.dp, color.copy(alpha = 0.35f))
    ) {
        Text(
            text = value.replace("_", " ").uppercase(),
            style = MaterialTheme.typography.labelMedium,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun PriorityStrip(priority: String, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .size(width = 4.dp, height = 54.dp)
            .clip(RoundedCornerShape(999.dp))
            .background(priorityColor(priority))
    )
}

@Composable
fun SearchBox(
    text: String,
    placeholder: String,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Icon(Icons.Default.Search, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        Text(
            text = text.ifBlank { placeholder },
            style = MaterialTheme.typography.bodyMedium,
            color = if (text.isBlank()) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
fun LoadingState(message: String = "Loading") {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator()
        Spacer(modifier = Modifier.height(12.dp))
        Text(message, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
fun EmptyState(title: String, body: String, modifier: Modifier = Modifier) {
    SyncMindCard(modifier = modifier) {
        Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        Text(body, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

fun statusColor(status: String): Color = when (status.lowercase()) {
    "in_progress", "in progress" -> StatusInProgress
    "resolved" -> StatusResolved
    "closed" -> StatusClosed
    else -> StatusOpen
}

fun priorityColor(priority: String): Color = when (priority.lowercase()) {
    "high" -> PriorityHigh
    "low" -> PriorityLow
    else -> PriorityNormal
}
