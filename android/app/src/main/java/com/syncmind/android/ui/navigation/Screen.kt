package com.syncmind.android.ui.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Projects : Screen("projects")
}
