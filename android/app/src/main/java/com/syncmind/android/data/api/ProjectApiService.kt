package com.syncmind.android.data.api

import com.syncmind.android.data.model.ProjectsResponse
import com.syncmind.android.data.model.ProjectResponse
import com.syncmind.android.data.model.ProjectMemberMutationResponse
import com.syncmind.android.data.model.ProjectMembersResponse
import com.syncmind.android.data.model.ProjectInvitationsResponse
import com.syncmind.android.data.model.SaveProjectMemberRequest
import com.syncmind.android.data.model.TransferProjectOwnershipRequest
import com.syncmind.android.data.model.CreateIssueCommentRequest
import com.syncmind.android.data.model.CreateIssueRequest
import com.syncmind.android.data.model.CreateMilestoneRequest
import com.syncmind.android.data.model.CreateProjectRequest
import com.syncmind.android.data.model.DashboardResponse
import com.syncmind.android.data.model.IssueCommentResponse
import com.syncmind.android.data.model.IssuesResponse
import com.syncmind.android.data.model.IssuesSummaryResponse
import com.syncmind.android.data.model.IssueResponse
import com.syncmind.android.data.model.MilestonesResponse
import com.syncmind.android.data.model.MilestoneResponse
import com.syncmind.android.data.model.MilestoneDateSuggestionResponse
import com.syncmind.android.data.model.MilestoneAiRequest
import com.syncmind.android.data.model.MilestoneRiskResponse
import com.syncmind.android.data.model.MilestoneSummaryResponse
import com.syncmind.android.data.model.MilestoneIssueSuggestionsResponse
import com.syncmind.android.data.model.SummarizeIssueRequest
import com.syncmind.android.data.model.SuggestIssueRequest
import com.syncmind.android.data.model.IssueAISuggestionResponse
import com.syncmind.android.data.model.SimilarIssuesResponse
import com.syncmind.android.data.model.SuggestExistingMilestoneDatesRequest
import com.syncmind.android.data.model.SuggestMilestoneIssuesRequest
import com.syncmind.android.data.model.SuggestMilestoneDatesRequest
import com.syncmind.android.data.model.ThreadSummaryResponse
import com.syncmind.android.data.model.UpdateIssueRequest
import com.syncmind.android.data.model.UpdateMilestoneRequest
import com.syncmind.android.data.model.UpdateProjectRequest
import com.syncmind.android.data.model.WikiPageResponse
import com.syncmind.android.data.model.WikiPagesResponse
import com.syncmind.android.data.model.WikiAiChatRequest
import com.syncmind.android.data.model.WikiAiChatResponse
import com.syncmind.android.data.model.WikiAiDraftRequest
import com.syncmind.android.data.model.WikiAiDraftResponse
import com.syncmind.android.data.model.SaveWikiPageRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Query

interface ProjectApiService {
    @GET("dashboard")
    suspend fun getDashboard(): Response<DashboardResponse>

    @GET("projects")
    suspend fun getProjects(): Response<ProjectsResponse>

    @GET("issues")
    suspend fun getGlobalIssues(): Response<IssuesResponse>

    @GET("issues/summary")
    suspend fun getIssuesSummary(): Response<IssuesSummaryResponse>

    @GET("issues/ai/similar")
    suspend fun getGlobalSimilarIssues(
        @Query("project_id") projectId: Int,
        @Query("text") text: String
    ): Response<SimilarIssuesResponse>

    @POST("projects")
    suspend fun createProject(@Body request: CreateProjectRequest): Response<ProjectResponse>

    @GET("projects/{projectId}")
    suspend fun getProject(@Path("projectId") projectId: Int): Response<ProjectResponse>

    @PUT("projects/{projectId}")
    suspend fun updateProject(
        @Path("projectId") projectId: Int,
        @Body request: UpdateProjectRequest
    ): Response<ProjectResponse>

    @DELETE("projects/{projectId}")
    suspend fun deleteProject(@Path("projectId") projectId: Int): Response<Unit>

    @POST("projects/{projectId}/transfer")
    suspend fun transferProjectOwnership(
        @Path("projectId") projectId: Int,
        @Body request: TransferProjectOwnershipRequest
    ): Response<ProjectMemberMutationResponse>

    @GET("projects/{projectId}/members")
    suspend fun getProjectMembers(@Path("projectId") projectId: Int): Response<ProjectMembersResponse>

    @POST("projects/{projectId}/members")
    suspend fun addProjectMember(
        @Path("projectId") projectId: Int,
        @Body request: SaveProjectMemberRequest
    ): Response<ProjectMemberMutationResponse>

    @PUT("projects/{projectId}/members/{userId}")
    suspend fun updateProjectMember(
        @Path("projectId") projectId: Int,
        @Path("userId") userId: Int,
        @Body request: SaveProjectMemberRequest
    ): Response<ProjectMemberMutationResponse>

    @DELETE("projects/{projectId}/members/{userId}")
    suspend fun removeProjectMember(
        @Path("projectId") projectId: Int,
        @Path("userId") userId: Int
    ): Response<ProjectMemberMutationResponse>

    @GET("projects/{projectId}/invitations")
    suspend fun getProjectInvitations(
        @Path("projectId") projectId: Int
    ): Response<ProjectInvitationsResponse>

    @DELETE("projects/{projectId}/invitations/{invitationId}")
    suspend fun cancelProjectInvitation(
        @Path("projectId") projectId: Int,
        @Path("invitationId") invitationId: Int
    ): Response<ProjectMemberMutationResponse>

    @GET("projects/{projectId}/issues")
    suspend fun getIssues(@Path("projectId") projectId: Int): Response<IssuesResponse>

    @POST("projects/{projectId}/issues")
    suspend fun createIssue(
        @Path("projectId") projectId: Int,
        @Body request: CreateIssueRequest
    ): Response<IssueResponse>

    @GET("projects/{projectId}/issues/{issueKey}")
    suspend fun getIssue(
        @Path("projectId") projectId: Int,
        @Path("issueKey") issueKey: String
    ): Response<IssueResponse>

    @PATCH("projects/{projectId}/issues/{issueKey}")
    suspend fun updateIssue(
        @Path("projectId") projectId: Int,
        @Path("issueKey") issueKey: String,
        @Body request: UpdateIssueRequest
    ): Response<IssueResponse>

    @DELETE("projects/{projectId}/issues/{issueKey}")
    suspend fun deleteIssue(
        @Path("projectId") projectId: Int,
        @Path("issueKey") issueKey: String
    ): Response<Unit>

    @POST("projects/{projectId}/issues/{issueKey}/comments")
    suspend fun createIssueComment(
        @Path("projectId") projectId: Int,
        @Path("issueKey") issueKey: String,
        @Body request: CreateIssueCommentRequest
    ): Response<IssueCommentResponse>

    @POST("projects/{projectId}/issues/{issueKey}/ai/summarize")
    suspend fun summarizeIssue(
        @Path("projectId") projectId: Int,
        @Path("issueKey") issueKey: String,
        @Body request: SummarizeIssueRequest
    ): Response<ThreadSummaryResponse>

    @POST("projects/{projectId}/ai/suggest-issue")
    suspend fun suggestIssue(
        @Path("projectId") projectId: Int,
        @Body request: SuggestIssueRequest
    ): Response<IssueAISuggestionResponse>

    @GET("projects/{projectId}/ai/similar-issues")
    suspend fun getSimilarIssues(
        @Path("projectId") projectId: Int,
        @Query("text") text: String
    ): Response<SimilarIssuesResponse>

    @GET("projects/{projectId}/milestones")
    suspend fun getMilestones(@Path("projectId") projectId: Int): Response<MilestonesResponse>

    @POST("projects/{projectId}/ai/suggest-milestone-dates")
    suspend fun suggestMilestoneDates(
        @Path("projectId") projectId: Int,
        @Body request: SuggestMilestoneDatesRequest
    ): Response<MilestoneDateSuggestionResponse>

    @POST("projects/{projectId}/milestones")
    suspend fun createMilestone(
        @Path("projectId") projectId: Int,
        @Body request: CreateMilestoneRequest
    ): Response<MilestoneResponse>

    @GET("projects/{projectId}/milestones/{milestoneId}")
    suspend fun getMilestone(
        @Path("projectId") projectId: Int,
        @Path("milestoneId") milestoneId: Int
    ): Response<MilestoneResponse>

    @POST("projects/{projectId}/milestones/{milestoneId}/ai/suggest-dates")
    suspend fun suggestExistingMilestoneDates(
        @Path("projectId") projectId: Int,
        @Path("milestoneId") milestoneId: Int,
        @Body request: SuggestExistingMilestoneDatesRequest
    ): Response<MilestoneDateSuggestionResponse>

    @POST("projects/{projectId}/milestones/{milestoneId}/ai/summarize")
    suspend fun summarizeMilestone(
        @Path("projectId") projectId: Int,
        @Path("milestoneId") milestoneId: Int,
        @Body request: MilestoneAiRequest
    ): Response<MilestoneSummaryResponse>

    @POST("projects/{projectId}/milestones/{milestoneId}/ai/risk-analysis")
    suspend fun analyzeMilestoneRisk(
        @Path("projectId") projectId: Int,
        @Path("milestoneId") milestoneId: Int,
        @Body request: MilestoneAiRequest
    ): Response<MilestoneRiskResponse>

    @POST("projects/{projectId}/milestones/{milestoneId}/ai/suggest-issues")
    suspend fun suggestMilestoneIssues(
        @Path("projectId") projectId: Int,
        @Path("milestoneId") milestoneId: Int,
        @Body request: SuggestMilestoneIssuesRequest
    ): Response<MilestoneIssueSuggestionsResponse>

    @PATCH("projects/{projectId}/milestones/{milestoneId}")
    suspend fun updateMilestone(
        @Path("projectId") projectId: Int,
        @Path("milestoneId") milestoneId: Int,
        @Body request: UpdateMilestoneRequest
    ): Response<MilestoneResponse>

    @DELETE("projects/{projectId}/milestones/{milestoneId}")
    suspend fun deleteMilestone(
        @Path("projectId") projectId: Int,
        @Path("milestoneId") milestoneId: Int
    ): Response<Unit>

    @GET("projects/{projectId}/wiki")
    suspend fun getWikiPages(@Path("projectId") projectId: Int): Response<WikiPagesResponse>

    @POST("projects/{projectId}/wiki")
    suspend fun createWikiPage(
        @Path("projectId") projectId: Int,
        @Body request: SaveWikiPageRequest
    ): Response<WikiPageResponse>

    @GET("projects/{projectId}/wiki/{wikiPageId}")
    suspend fun getWikiPage(
        @Path("projectId") projectId: Int,
        @Path("wikiPageId") wikiPageId: Int
    ): Response<WikiPageResponse>

    @PATCH("projects/{projectId}/wiki/{wikiPageId}")
    suspend fun updateWikiPage(
        @Path("projectId") projectId: Int,
        @Path("wikiPageId") wikiPageId: Int,
        @Body request: SaveWikiPageRequest
    ): Response<WikiPageResponse>

    @DELETE("projects/{projectId}/wiki/{wikiPageId}")
    suspend fun deleteWikiPage(
        @Path("projectId") projectId: Int,
        @Path("wikiPageId") wikiPageId: Int
    ): Response<Unit>

    @POST("projects/{projectId}/wiki/ai/chat")
    suspend fun wikiAiChat(
        @Path("projectId") projectId: Int,
        @Body request: WikiAiChatRequest
    ): Response<WikiAiChatResponse>

    @POST("projects/{projectId}/wiki/ai/draft")
    suspend fun wikiAiDraft(
        @Path("projectId") projectId: Int,
        @Body request: WikiAiDraftRequest
    ): Response<WikiAiDraftResponse>
}
