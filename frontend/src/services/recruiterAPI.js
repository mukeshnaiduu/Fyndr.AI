import { apiRequest, getApiUrl } from '../utils/api';

class RecruiterAPI {
	async listJobs(params = {}) {
		const qs = new URLSearchParams();
		if (params.page) qs.append('page', params.page);
		if (params.pageSize) qs.append('page_size', params.pageSize);
		if (params.is_active !== undefined) qs.append('is_active', params.is_active);
		if (params.ordering) qs.append('ordering', params.ordering);
		return apiRequest(`/recruiter/jobs/?${qs.toString()}`);
	}

	async createJob(data) {
		return apiRequest('/recruiter/jobs/', 'POST', data);
	}

	async updateJob(id, data) {
		return apiRequest(`/recruiter/jobs/${id}/`, 'PATCH', data);
	}

	async deleteJob(id) {
		// Soft delete (set is_active=false) if backend supports; otherwise use DELETE
		try {
			return await apiRequest(`/recruiter/jobs/${id}/`, 'DELETE');
		} catch (e) {
			// Fallback to soft
			return this.updateJob(id, { is_active: false });
		}
	}

	async listApplicants(jobId, params = {}) {
		const qs = new URLSearchParams();
		qs.append('job_id', jobId);
		if (params.page) qs.append('page', params.page);
		if (params.pageSize) qs.append('page_size', params.pageSize);
		if (params.status) qs.append('status', params.status);
		return apiRequest(`/applications/recruiter/applicants/?${qs.toString()}`);
	}

	async getApplicationEvents(applicationId) {
		return apiRequest(`/applications/recruiter/applications/${applicationId}/events/`);
	}

	async updateApplicationStatus(applicationId, status, notes = '') {
		return apiRequest(`/applications/recruiter/applications/${applicationId}/update-status/`, 'POST', { status, notes });
	}

	getDownloadUrl(applicationId, fileType = 'resume') {
		// Protected route - open in new tab; auth via token/cookie
		return getApiUrl(`/applications/recruiter/download/${applicationId}/${fileType}/`);
	}
}

const recruiterAPI = new RecruiterAPI();
export default recruiterAPI;
