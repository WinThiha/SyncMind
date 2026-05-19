package com.syncmind.android.data.api

import com.syncmind.android.data.model.AcceptInvitationResponse
import com.syncmind.android.data.model.InvitationInfoResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface InvitationApiService {
    @GET("invitations/{token}")
    suspend fun getInvitation(@Path("token") token: String): Response<InvitationInfoResponse>

    @POST("invitations/{token}/accept")
    suspend fun acceptInvitation(@Path("token") token: String): Response<AcceptInvitationResponse>
}
