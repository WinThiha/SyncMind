package com.syncmind.android.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navDeepLink
import androidx.navigation.navArgument
import com.syncmind.android.util.Constants.WEB_BASE_URL
import com.syncmind.android.ui.auth.ForgotPasswordScreen
import com.syncmind.android.ui.auth.LoginScreen
import com.syncmind.android.ui.auth.RegisterScreen
import com.syncmind.android.ui.auth.ResetPasswordScreen
import com.syncmind.android.ui.auth.VerifyEmailScreen
import com.syncmind.android.ui.dashboard.DashboardScreen
import com.syncmind.android.ui.issues.GlobalIssuesScreen
import com.syncmind.android.ui.invitations.InvitationScreen
import com.syncmind.android.ui.projects.CreateProjectScreen
import com.syncmind.android.ui.projects.CreateIssueScreen
import com.syncmind.android.ui.projects.CreateMilestoneScreen
import com.syncmind.android.ui.projects.EditIssueScreen
import com.syncmind.android.ui.projects.EditMilestoneScreen
import com.syncmind.android.ui.projects.EditProjectScreen
import com.syncmind.android.ui.projects.IssueDetailScreen
import com.syncmind.android.ui.projects.ProjectDetailScreen
import com.syncmind.android.ui.projects.ProjectListScreen
import com.syncmind.android.ui.projects.ProjectMembersScreen
import com.syncmind.android.ui.settings.SettingsScreen
import com.syncmind.android.ui.wiki.CreateWikiPageScreen
import com.syncmind.android.ui.wiki.EditWikiPageScreen
import com.syncmind.android.ui.wiki.WikiPageScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String
) {
    val webBaseUrl = WEB_BASE_URL

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Projects.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onRegisterClick = {
                    navController.navigate(Screen.Register.route)
                },
                onForgotPasswordClick = {
                    navController.navigate(Screen.ForgotPassword.route)
                },
                onSocialRegister = { socialUser ->
                    navController.navigate(
                        Screen.Register.createSocialRoute(
                            name = socialUser.name.orEmpty(),
                            email = socialUser.email,
                            provider = socialUser.provider_name,
                            socialId = socialUser.provider_id
                        )
                    )
                }
            )
        }
        composable(
            route = Screen.Register.route,
            arguments = listOf(
                navArgument("name") {
                    type = NavType.StringType
                    defaultValue = ""
                },
                navArgument("email") {
                    type = NavType.StringType
                    defaultValue = ""
                },
                navArgument("provider") {
                    type = NavType.StringType
                    defaultValue = ""
                },
                navArgument("socialId") {
                    type = NavType.StringType
                    defaultValue = ""
                }
            )
        ) { backStackEntry ->
            RegisterScreen(
                onBack = { navController.popBackStack() },
                onRegisterSuccess = {
                    navController.navigate(Screen.Projects.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                initialName = backStackEntry.arguments?.getString("name").orEmpty(),
                initialEmail = backStackEntry.arguments?.getString("email").orEmpty(),
                socialProvider = backStackEntry.arguments?.getString("provider").orEmpty(),
                socialId = backStackEntry.arguments?.getString("socialId").orEmpty()
            )
        }
        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable(
            route = Screen.ResetPassword.route,
            arguments = listOf(
                navArgument("token") {
                    type = NavType.StringType
                    defaultValue = ""
                },
                navArgument("email") {
                    type = NavType.StringType
                    defaultValue = ""
                }
            ),
            deepLinks = listOf(
                navDeepLink { uriPattern = "$webBaseUrl/reset-password?token={token}&email={email}" }
            )
        ) { backStackEntry ->
            ResetPasswordScreen(
                token = backStackEntry.arguments?.getString("token").orEmpty(),
                email = backStackEntry.arguments?.getString("email").orEmpty(),
                onBack = { navController.popBackStack() },
                onLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.ResetPassword.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.VerifyEmail.route,
            arguments = listOf(
                navArgument("verifyUrl") {
                    type = NavType.StringType
                    defaultValue = ""
                }
            ),
            deepLinks = listOf(
                navDeepLink { uriPattern = "$webBaseUrl/verify-email?verify_url={verifyUrl}" }
            )
        ) { backStackEntry ->
            VerifyEmailScreen(
                verifyUrl = backStackEntry.arguments?.getString("verifyUrl").orEmpty(),
                onBack = { navController.popBackStack() },
                onDone = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.VerifyEmail.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Projects.route) {
            ProjectListScreen(
                onProjectClick = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId))
                },
                onCreateProjectClick = {
                    navController.navigate(Screen.CreateProject.route)
                },
                onSettingsClick = {
                    navController.navigate(Screen.Settings.route)
                },
                onDashboardClick = {
                    navController.navigate(Screen.Dashboard.route)
                },
                onGlobalIssuesClick = {
                    navController.navigate(Screen.GlobalIssues.route)
                },
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Projects.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Settings.route) {
            SettingsScreen(
                onBack = { navController.popBackStack() },
                onDashboardClick = { navController.navigate(Screen.Dashboard.route) },
                onProjectsClick = { navController.navigate(Screen.Projects.route) },
                onIssuesClick = { navController.navigate(Screen.GlobalIssues.route) }
            )
        }
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onBack = { navController.popBackStack() },
                onProjectsClick = { navController.navigate(Screen.Projects.route) },
                onIssuesClick = { navController.navigate(Screen.GlobalIssues.route) },
                onSettingsClick = { navController.navigate(Screen.Settings.route) }
            )
        }
        composable(Screen.GlobalIssues.route) {
            GlobalIssuesScreen(
                onBack = { navController.popBackStack() },
                onDashboardClick = { navController.navigate(Screen.Dashboard.route) },
                onProjectsClick = { navController.navigate(Screen.Projects.route) },
                onSettingsClick = { navController.navigate(Screen.Settings.route) }
            )
        }
        composable(
            route = Screen.Invitation.route,
            arguments = listOf(navArgument("token") { type = NavType.StringType }),
            deepLinks = listOf(
                navDeepLink { uriPattern = "$webBaseUrl/invitations/{token}" }
            )
        ) { backStackEntry ->
            InvitationScreen(
                token = backStackEntry.arguments?.getString("token").orEmpty(),
                onBack = { navController.popBackStack() },
                onLogin = {
                    navController.navigate(Screen.Login.route)
                },
                onAccepted = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId)) {
                        popUpTo(Screen.Invitation.route) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.CreateProject.route) {
            CreateProjectScreen(
                onBack = { navController.popBackStack() },
                onProjectCreated = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId)) {
                        popUpTo(Screen.CreateProject.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.EditProject.route,
            arguments = listOf(navArgument("projectId") { type = NavType.IntType })
        ) { backStackEntry ->
            EditProjectScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                onBack = { navController.popBackStack() },
                onProjectUpdated = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId)) {
                        popUpTo(Screen.EditProject.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.ProjectDetail.route,
            arguments = listOf(navArgument("projectId") { type = NavType.IntType })
        ) { backStackEntry ->
            ProjectDetailScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                onIssueClick = { projectId, issueKey ->
                    navController.navigate(Screen.IssueDetail.createRoute(projectId, issueKey))
                },
                onCreateIssueClick = { projectId ->
                    navController.navigate(Screen.CreateIssue.createRoute(projectId))
                },
                onCreateMilestoneClick = { projectId ->
                    navController.navigate(Screen.CreateMilestone.createRoute(projectId))
                },
                onMilestoneClick = { projectId, milestoneId ->
                    navController.navigate(Screen.EditMilestone.createRoute(projectId, milestoneId))
                },
                onWikiPageClick = { projectId, wikiPageId ->
                    navController.navigate(Screen.WikiPage.createRoute(projectId, wikiPageId))
                },
                onCreateWikiPageClick = { projectId ->
                    navController.navigate(Screen.CreateWikiPage.createRoute(projectId))
                },
                onEditProjectClick = { projectId ->
                    navController.navigate(Screen.EditProject.createRoute(projectId))
                },
                onManageMembersClick = { projectId ->
                    navController.navigate(Screen.ProjectMembers.createRoute(projectId))
                },
                onDeleted = {
                    navController.navigate(Screen.Projects.route) {
                        popUpTo(Screen.Projects.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }
        composable(
            route = Screen.ProjectMembers.route,
            arguments = listOf(navArgument("projectId") { type = NavType.IntType })
        ) { backStackEntry ->
            ProjectMembersScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                onBack = { navController.popBackStack() }
            )
        }
        composable(
            route = Screen.CreateMilestone.route,
            arguments = listOf(navArgument("projectId") { type = NavType.IntType })
        ) { backStackEntry ->
            CreateMilestoneScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                onBack = { navController.popBackStack() },
                onMilestoneCreated = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId)) {
                        popUpTo(Screen.CreateMilestone.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.EditMilestone.route,
            arguments = listOf(
                navArgument("projectId") { type = NavType.IntType },
                navArgument("milestoneId") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            EditMilestoneScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                milestoneId = backStackEntry.arguments?.getInt("milestoneId") ?: 0,
                onBack = { navController.popBackStack() },
                onMilestoneUpdated = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId)) {
                        popUpTo(Screen.EditMilestone.route) { inclusive = true }
                    }
                },
                onMilestoneDeleted = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId)) {
                        popUpTo(Screen.EditMilestone.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.CreateIssue.route,
            arguments = listOf(navArgument("projectId") { type = NavType.IntType })
        ) { backStackEntry ->
            CreateIssueScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                onBack = { navController.popBackStack() },
                onIssueCreated = { projectId, issueKey ->
                    navController.navigate(Screen.IssueDetail.createRoute(projectId, issueKey)) {
                        popUpTo(Screen.CreateIssue.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.EditIssue.route,
            arguments = listOf(
                navArgument("projectId") { type = NavType.IntType },
                navArgument("issueKey") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            EditIssueScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                issueKey = backStackEntry.arguments?.getString("issueKey").orEmpty(),
                onBack = { navController.popBackStack() },
                onIssueUpdated = { projectId, issueKey ->
                    navController.navigate(Screen.IssueDetail.createRoute(projectId, issueKey)) {
                        popUpTo(Screen.EditIssue.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.IssueDetail.route,
            arguments = listOf(
                navArgument("projectId") { type = NavType.IntType },
                navArgument("issueKey") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            IssueDetailScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                issueKey = backStackEntry.arguments?.getString("issueKey").orEmpty(),
                onEdit = { projectId, issueKey ->
                    navController.navigate(Screen.EditIssue.createRoute(projectId, issueKey))
                },
                onDeleted = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId)) {
                        popUpTo(Screen.IssueDetail.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }
        composable(
            route = Screen.CreateWikiPage.route,
            arguments = listOf(navArgument("projectId") { type = NavType.IntType })
        ) { backStackEntry ->
            CreateWikiPageScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                onBack = { navController.popBackStack() },
                onWikiPageSaved = { projectId, wikiPageId ->
                    navController.navigate(Screen.WikiPage.createRoute(projectId, wikiPageId)) {
                        popUpTo(Screen.CreateWikiPage.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.EditWikiPage.route,
            arguments = listOf(
                navArgument("projectId") { type = NavType.IntType },
                navArgument("wikiPageId") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            EditWikiPageScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                wikiPageId = backStackEntry.arguments?.getInt("wikiPageId") ?: 0,
                onBack = { navController.popBackStack() },
                onWikiPageSaved = { projectId, wikiPageId ->
                    navController.navigate(Screen.WikiPage.createRoute(projectId, wikiPageId)) {
                        popUpTo(Screen.EditWikiPage.route) { inclusive = true }
                    }
                }
            )
        }
        composable(
            route = Screen.WikiPage.route,
            arguments = listOf(
                navArgument("projectId") { type = NavType.IntType },
                navArgument("wikiPageId") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            WikiPageScreen(
                projectId = backStackEntry.arguments?.getInt("projectId") ?: 0,
                wikiPageId = backStackEntry.arguments?.getInt("wikiPageId") ?: 0,
                onEdit = { projectId, wikiPageId ->
                    navController.navigate(Screen.EditWikiPage.createRoute(projectId, wikiPageId))
                },
                onDeleted = { projectId ->
                    navController.navigate(Screen.ProjectDetail.createRoute(projectId)) {
                        popUpTo(Screen.WikiPage.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }
    }
}
