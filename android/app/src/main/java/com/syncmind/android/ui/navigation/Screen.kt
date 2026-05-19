package com.syncmind.android.ui.navigation

import android.net.Uri

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register?name={name}&email={email}&provider={provider}&socialId={socialId}") {
        fun createSocialRoute(name: String, email: String, provider: String, socialId: String): String {
            return "register?name=${Uri.encode(name)}&email=${Uri.encode(email)}&provider=${Uri.encode(provider)}&socialId=${Uri.encode(socialId)}"
        }
    }
    object ForgotPassword : Screen("forgot-password")
    object ResetPassword : Screen("reset-password?token={token}&email={email}") {
        fun createRoute(token: String, email: String): String {
            return "reset-password?token=${Uri.encode(token)}&email=${Uri.encode(email)}"
        }
    }
    object VerifyEmail : Screen("verify-email?verify_url={verifyUrl}") {
        fun createRoute(verifyUrl: String): String = "verify-email?verify_url=${Uri.encode(verifyUrl)}"
    }
    object Projects : Screen("projects")
    object Dashboard : Screen("dashboard")
    object GlobalIssues : Screen("issues")
    object CreateProject : Screen("projects/new")
    object Settings : Screen("settings")
    object Invitation : Screen("invitations/{token}") {
        fun createRoute(token: String): String = "invitations/${Uri.encode(token)}"
    }
    object ProjectDetail : Screen("projects/{projectId}") {
        fun createRoute(projectId: Int): String = "projects/$projectId"
    }
    object EditProject : Screen("projects/{projectId}/edit") {
        fun createRoute(projectId: Int): String = "projects/$projectId/edit"
    }
    object ProjectMembers : Screen("projects/{projectId}/members") {
        fun createRoute(projectId: Int): String = "projects/$projectId/members"
    }
    object CreateMilestone : Screen("projects/{projectId}/milestones/new") {
        fun createRoute(projectId: Int): String = "projects/$projectId/milestones/new"
    }
    object EditMilestone : Screen("projects/{projectId}/milestones/{milestoneId}/edit") {
        fun createRoute(projectId: Int, milestoneId: Int): String = "projects/$projectId/milestones/$milestoneId/edit"
    }
    object CreateIssue : Screen("projects/{projectId}/issues/new") {
        fun createRoute(projectId: Int): String = "projects/$projectId/issues/new"
    }
    object IssueDetail : Screen("projects/{projectId}/issues/{issueKey}") {
        fun createRoute(projectId: Int, issueKey: String): String {
            return "projects/$projectId/issues/${Uri.encode(issueKey)}"
        }
    }
    object EditIssue : Screen("projects/{projectId}/issues/{issueKey}/edit") {
        fun createRoute(projectId: Int, issueKey: String): String {
            return "projects/$projectId/issues/${Uri.encode(issueKey)}/edit"
        }
    }
    object WikiPage : Screen("projects/{projectId}/wiki/{wikiPageId}") {
        fun createRoute(projectId: Int, wikiPageId: Int): String = "projects/$projectId/wiki/$wikiPageId"
    }
    object CreateWikiPage : Screen("projects/{projectId}/wiki/new") {
        fun createRoute(projectId: Int): String = "projects/$projectId/wiki/new"
    }
    object EditWikiPage : Screen("projects/{projectId}/wiki/{wikiPageId}/edit") {
        fun createRoute(projectId: Int, wikiPageId: Int): String = "projects/$projectId/wiki/$wikiPageId/edit"
    }
}
