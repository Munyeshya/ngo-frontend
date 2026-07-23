const endpoints = {
  projects: '/projects/',
  projectDetails: (id) => `/projects/${id}/`,
  projectTransparencyReport: (id) => `/projects/${id}/transparency-report/`,

  partners: '/projects/partners/',
  partnerDetails: (id) => `/projects/partners/${id}/`,

  beneficiaries: '/beneficiaries/',
  beneficiaryDetails: (id) => `/beneficiaries/${id}/`,
  beneficiaryImages: '/beneficiaries/images/',
  beneficiaryImageDetails: (id) => `/beneficiaries/images/${id}/`,

  donations: '/donations/',
  donationTypeSupportAnalytics: '/donations/type-support-analytics/',

  projectUpdates: '/projects/updates/',
  projectUpdateDetails: (id) => `/projects/updates/${id}/`,
  projectUpdateImages: '/projects/updates/images/',
  projectUpdateImageDetails: (id) => `/projects/updates/images/${id}/`,
  projectUpdateDocuments: '/projects/updates/documents/',
  projectUpdateDocumentDetails: (id) => `/projects/updates/documents/${id}/`,
  projectImpactMetrics: '/projects/impact-metrics/',
  projectImpactMetricDetails: (id) => `/projects/impact-metrics/${id}/`,
  projectImpactRecords: '/projects/impact-records/',
  projectImpactRecordDetails: (id) => `/projects/impact-records/${id}/`,
  projectReports: '/projects/reports/',
  projectCashouts: '/projects/cashouts/',

  subscribeToProject: '/projects/interests/subscribe/',
  unsubscribeFromProject: '/projects/interests/unsubscribe/',
  
  login: '/users/login/',
  register: '/users/register/',
  refreshToken: '/users/token/refresh/',
  logout: '/users/logout/',
  profile: '/users/profile/',
  me: '/users/me/',
  users: '/users/',
  userDetails: (id) => `/users/${id}/`,
  myStaffApplication: '/users/staff-application/',
  staffApplications: '/users/staff-applications/',
  staffApplicationDetails: (id) => `/users/staff-applications/${id}/`,
  claimDonorAccount: '/users/claim-donor-account/',
  claimDonorAccountVerify: '/users/claim-donor-account/verify/',
   
  myDonations: '/donations/my/',
  myInterests: '/projects/interests/my/',
}

export default endpoints
