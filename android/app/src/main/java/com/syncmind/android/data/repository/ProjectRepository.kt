package com.syncmind.android.data.repository

import com.syncmind.android.data.api.ProjectApiService
import com.syncmind.android.data.model.CreateIssueCommentRequest
import com.syncmind.android.data.model.CreateIssueRequest
import com.syncmind.android.data.model.CreateMilestoneRequest
import com.syncmind.android.data.model.CreateProjectRequest
import com.syncmind.android.data.model.DashboardData
import com.syncmind.android.data.model.Issue
import com.syncmind.android.data.model.IssueAISuggestion
import com.syncmind.android.data.model.IssueComment
import com.syncmind.android.data.model.IssuesSummary
import com.syncmind.android.data.model.Milestone
import com.syncmind.android.data.model.MilestoneAiRequest
import com.syncmind.android.data.model.MilestoneDateSuggestion
import com.syncmind.android.data.model.MilestoneIssueSuggestion
import com.syncmind.android.data.model.MilestoneRiskResult
import com.syncmind.android.data.model.MilestoneSummaryResult
import com.syncmind.android.data.model.Project
import com.syncmind.android.data.model.ProjectInvitation
import com.syncmind.android.data.model.ProjectMember
import com.syncmind.android.data.model.SaveProjectMemberRequest
import com.syncmind.android.data.model.SimilarIssue
import com.syncmind.android.data.model.SummarizeIssueRequest
import com.syncmind.android.data.model.SuggestExistingMilestoneDatesRequest
import com.syncmind.android.data.model.SuggestMilestoneIssuesRequest
import com.syncmind.android.data.model.SuggestMilestoneDatesRequest
import com.syncmind.android.data.model.SuggestIssueRequest
import com.syncmind.android.data.model.ThreadSummary
import com.syncmind.android.data.model.TransferProjectOwnershipRequest
import com.syncmind.android.data.model.UpdateIssueRequest
import com.syncmind.android.data.model.UpdateMilestoneRequest
import com.syncmind.android.data.model.UpdateProjectRequest
import com.syncmind.android.data.model.WikiPage
import com.syncmind.android.data.model.SaveWikiPageRequest
import com.syncmind.android.data.model.WikiAiChatMessage
import com.syncmind.android.data.model.WikiAiChatRequest
import com.syncmind.android.data.model.WikiAiDraftRequest
import com.syncmind.android.util.NetworkResult
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProjectRepository @Inject constructor(
    private val apiService: ProjectApiService
) {
    suspend fun getDashboard(): NetworkResult<DashboardData> {
        return try {
            val response = apiService.getDashboard()
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getProjects(): NetworkResult<List<Project>> {
        return try {
            val response = apiService.getProjects()
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getGlobalIssues(): NetworkResult<List<Issue>> {
        return try {
            val response = apiService.getGlobalIssues()
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getIssuesSummary(): NetworkResult<IssuesSummary> {
        return try {
            val response = apiService.getIssuesSummary()
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getGlobalSimilarIssues(projectId: Int, text: String): NetworkResult<List<SimilarIssue>> {
        return try {
            val response = apiService.getGlobalSimilarIssues(projectId, text)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun createProject(request: CreateProjectRequest): NetworkResult<Project> {
        return try {
            val response = apiService.createProject(request)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getProject(projectId: Int): NetworkResult<Project> {
        return try {
            val response = apiService.getProject(projectId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun updateProject(projectId: Int, request: UpdateProjectRequest): NetworkResult<Project> {
        return try {
            val response = apiService.updateProject(projectId, request)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun deleteProject(projectId: Int): NetworkResult<Unit> {
        return try {
            val response = apiService.deleteProject(projectId)
            if (response.isSuccessful) {
                NetworkResult.Success(Unit)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun transferProjectOwnership(projectId: Int, newCreatorId: Int): NetworkResult<String> {
        return try {
            val response = apiService.transferProjectOwnership(
                projectId = projectId,
                request = TransferProjectOwnershipRequest(new_creator_id = newCreatorId)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.message)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getProjectMembers(projectId: Int): NetworkResult<List<ProjectMember>> {
        return try {
            val response = apiService.getProjectMembers(projectId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun addProjectMember(
        projectId: Int,
        email: String,
        role: String,
        position: String?
    ): NetworkResult<String> {
        return try {
            val response = apiService.addProjectMember(
                projectId,
                SaveProjectMemberRequest(email = email, role = role, position = position)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.message)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun updateProjectMember(
        projectId: Int,
        userId: Int,
        role: String,
        position: String?
    ): NetworkResult<String> {
        return try {
            val response = apiService.updateProjectMember(
                projectId = projectId,
                userId = userId,
                request = SaveProjectMemberRequest(role = role, position = position)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.message)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun removeProjectMember(projectId: Int, userId: Int): NetworkResult<String> {
        return try {
            val response = apiService.removeProjectMember(projectId, userId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.message)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getProjectInvitations(projectId: Int): NetworkResult<List<ProjectInvitation>> {
        return try {
            val response = apiService.getProjectInvitations(projectId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun cancelProjectInvitation(projectId: Int, invitationId: Int): NetworkResult<String> {
        return try {
            val response = apiService.cancelProjectInvitation(projectId, invitationId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.message)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getIssues(projectId: Int): NetworkResult<List<Issue>> {
        return try {
            val response = apiService.getIssues(projectId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun createIssue(
        projectId: Int,
        request: CreateIssueRequest
    ): NetworkResult<Issue> {
        return try {
            val response = apiService.createIssue(projectId, request)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getIssue(projectId: Int, issueKey: String): NetworkResult<Issue> {
        return try {
            val response = apiService.getIssue(projectId, issueKey)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun updateIssue(
        projectId: Int,
        issueKey: String,
        request: UpdateIssueRequest
    ): NetworkResult<Issue> {
        return try {
            val response = apiService.updateIssue(projectId, issueKey, request)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun deleteIssue(projectId: Int, issueKey: String): NetworkResult<Unit> {
        return try {
            val response = apiService.deleteIssue(projectId, issueKey)
            if (response.isSuccessful) {
                NetworkResult.Success(Unit)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun createIssueComment(
        projectId: Int,
        issueKey: String,
        content: String
    ): NetworkResult<IssueComment> {
        return try {
            val response = apiService.createIssueComment(
                projectId = projectId,
                issueKey = issueKey,
                request = CreateIssueCommentRequest(content = content)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun summarizeIssue(
        projectId: Int,
        issueKey: String,
        force: Boolean = false
    ): NetworkResult<ThreadSummary> {
        return try {
            val response = apiService.summarizeIssue(
                projectId = projectId,
                issueKey = issueKey,
                request = SummarizeIssueRequest(force = force)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun suggestIssue(projectId: Int, summary: String): NetworkResult<IssueAISuggestion> {
        return try {
            val response = apiService.suggestIssue(projectId, SuggestIssueRequest(summary = summary))
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getSimilarIssues(projectId: Int, text: String): NetworkResult<List<SimilarIssue>> {
        return try {
            val response = apiService.getSimilarIssues(projectId, text)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getMilestones(projectId: Int): NetworkResult<List<Milestone>> {
        return try {
            val response = apiService.getMilestones(projectId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun suggestMilestoneDates(
        projectId: Int,
        name: String,
        description: String?
    ): NetworkResult<MilestoneDateSuggestion> {
        return try {
            val response = apiService.suggestMilestoneDates(
                projectId = projectId,
                request = SuggestMilestoneDatesRequest(
                    name = name,
                    description = description,
                    context = null
                )
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun createMilestone(
        projectId: Int,
        request: CreateMilestoneRequest
    ): NetworkResult<Milestone> {
        return try {
            val response = apiService.createMilestone(projectId, request)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getMilestone(projectId: Int, milestoneId: Int): NetworkResult<Milestone> {
        return try {
            val response = apiService.getMilestone(projectId, milestoneId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun suggestExistingMilestoneDates(
        projectId: Int,
        milestoneId: Int
    ): NetworkResult<MilestoneDateSuggestion> {
        return try {
            val response = apiService.suggestExistingMilestoneDates(
                projectId = projectId,
                milestoneId = milestoneId,
                request = SuggestExistingMilestoneDatesRequest(context = null)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun summarizeMilestone(
        projectId: Int,
        milestoneId: Int,
        force: Boolean = false
    ): NetworkResult<MilestoneSummaryResult> {
        return try {
            val response = apiService.summarizeMilestone(projectId, milestoneId, MilestoneAiRequest(force))
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun analyzeMilestoneRisk(
        projectId: Int,
        milestoneId: Int,
        force: Boolean = false
    ): NetworkResult<MilestoneRiskResult> {
        return try {
            val response = apiService.analyzeMilestoneRisk(projectId, milestoneId, MilestoneAiRequest(force))
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun suggestMilestoneIssues(
        projectId: Int,
        milestoneId: Int,
        limit: Int = 10
    ): NetworkResult<List<MilestoneIssueSuggestion>> {
        return try {
            val response = apiService.suggestMilestoneIssues(
                projectId = projectId,
                milestoneId = milestoneId,
                request = SuggestMilestoneIssuesRequest(limit = limit)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun updateMilestone(
        projectId: Int,
        milestoneId: Int,
        request: UpdateMilestoneRequest
    ): NetworkResult<Milestone> {
        return try {
            val response = apiService.updateMilestone(projectId, milestoneId, request)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun deleteMilestone(projectId: Int, milestoneId: Int): NetworkResult<Unit> {
        return try {
            val response = apiService.deleteMilestone(projectId, milestoneId)
            if (response.isSuccessful) {
                NetworkResult.Success(Unit)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getWikiPages(projectId: Int): NetworkResult<List<WikiPage>> {
        return try {
            val response = apiService.getWikiPages(projectId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun createWikiPage(
        projectId: Int,
        request: SaveWikiPageRequest
    ): NetworkResult<WikiPage> {
        return try {
            val response = apiService.createWikiPage(projectId, request)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun getWikiPage(projectId: Int, wikiPageId: Int): NetworkResult<WikiPage> {
        return try {
            val response = apiService.getWikiPage(projectId, wikiPageId)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun updateWikiPage(
        projectId: Int,
        wikiPageId: Int,
        request: SaveWikiPageRequest
    ): NetworkResult<WikiPage> {
        return try {
            val response = apiService.updateWikiPage(projectId, wikiPageId, request)
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.data)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun deleteWikiPage(projectId: Int, wikiPageId: Int): NetworkResult<Unit> {
        return try {
            val response = apiService.deleteWikiPage(projectId, wikiPageId)
            if (response.isSuccessful) {
                NetworkResult.Success(Unit)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun wikiAiChat(
        projectId: Int,
        message: String,
        history: List<WikiAiChatMessage>
    ): NetworkResult<String> {
        return try {
            val response = apiService.wikiAiChat(
                projectId = projectId,
                request = WikiAiChatRequest(message = message, history = history)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.answer)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }

    suspend fun wikiAiDraft(projectId: Int, prompt: String): NetworkResult<String> {
        return try {
            val response = apiService.wikiAiDraft(
                projectId = projectId,
                request = WikiAiDraftRequest(prompt = prompt)
            )
            if (response.isSuccessful && response.body() != null) {
                NetworkResult.Success(response.body()!!.content)
            } else {
                NetworkResult.Error(response.message(), response.code())
            }
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Unknown error occurred")
        }
    }
}
